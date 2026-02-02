import { supabase } from '../../config/supabase.js';
import { getUserTeam } from '../../utils/hierarchy.js';

export const getDashboardStats = async (userId, userRole) => {
  let userIds = [userId];

  // If admin/owner, get stats for entire team
  if (['owner', 'admin'].includes(userRole)) {
    const team = await getUserTeam(userId);
    userIds = team.map(member => member.id);
  }

  // Total leads
  let leadsQuery = supabase
    .from('leads')
    .select('*', { count: 'exact', head: true });

  if (userRole === 'admin') {
    leadsQuery = leadsQuery.eq('created_by', userId);
  } else if (!['owner'].includes(userRole)) {
    leadsQuery = leadsQuery.in('assigned_to', userIds);
  }

  const { count: totalLeads } = await leadsQuery;

  // Leads by status
  const { data: leadsByStatus } = await supabase
    .from('leads')
    .select('status')
    .in(userRole === 'admin' ? 'created_by' : 'assigned_to', userIds);

  const statusCounts = {
    new: 0,
    contacted: 0,
    interested: 0,
    not_interested: 0,
    prospect: 0,
    converted: 0,
    spam: 0
  };

  leadsByStatus?.forEach(lead => {
    if (statusCounts.hasOwnProperty(lead.status)) {
      statusCounts[lead.status]++;
    }
  });

  // Pending followups
  const { count: pendingFollowups } = await supabase
    .from('followups')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'pending');

  // Missed followups (backlog)
  const { count: missedFollowups } = await supabase
    .from('followups')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'missed');

  // Upcoming meetings
  const { count: upcomingMeetings } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString());

  // Upcoming visits
  const { count: upcomingVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString());

  // Team members (for admin/owner)
  let teamMembers = null;
  if (['owner', 'admin'].includes(userRole)) {
    const team = await getUserTeam(userId);
    teamMembers = {
      total: team.length,
      active: team.filter(m => m.is_active).length,
      inactive: team.filter(m => !m.is_active).length
    };
  }

  // This month's performance
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: monthMeetings } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'completed')
    .gte('completed_at', monthStart.toISOString());

  const { count: monthVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'completed')
    .gte('completed_at', monthStart.toISOString());

  return {
    overview: {
      totalLeads: totalLeads || 0,
      pendingFollowups: pendingFollowups || 0,
      missedFollowups: missedFollowups || 0,
      upcomingMeetings: upcomingMeetings || 0,
      upcomingVisits: upcomingVisits || 0
    },
    leadsByStatus: statusCounts,
    thisMonth: {
      meetings: monthMeetings || 0,
      visits: monthVisits || 0
    },
    team: teamMembers
  };
};
