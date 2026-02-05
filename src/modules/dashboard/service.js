import { supabase } from '../../config/supabase.js';
import { getUserTeam } from '../../utils/hierarchy.js';

export const getDashboardStats = async (userId, userRole) => {
  let userIds = [userId];

  // If admin/owner, get stats for entire team
  if (['owner', 'admin'].includes(userRole)) {
    const team = await getUserTeam(userId);
    userIds = team.map(member => member.id);
  }

  // Get all users for team counts
  const { data: allUsers } = await supabase
    .from('users')
    .select('role, is_active');

  const totalAdmins = allUsers?.filter(u => u.role === 'admin').length || 0;
  const totalManagers = allUsers?.filter(u => u.role === 'manager').length || 0;
  const totalEmployees = allUsers?.filter(u => u.role === 'employee').length || 0;
  const activeUsers = allUsers?.filter(u => u.is_active).length || 0;

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

  // Leads by type
  const { data: allLeads } = await supabase
    .from('leads')
    .select('type');

  const websiteLeads = allLeads?.filter(l => l.type === 'lead').length || 0;
  const marketData = allLeads?.filter(l => l.type === 'data').length || 0;

  // Deleted leads count
  const { count: deletedLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .not('deleted_at', 'is', null);

  // This month's performance
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count: totalMeetings } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'completed')
    .gte('completed_at', monthStart.toISOString());

  const { count: totalVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('status', 'completed')
    .gte('completed_at', monthStart.toISOString());

  // Total calls this month (from logs table)
  const { count: totalCalls } = await supabase
    .from('logs')
    .select('*', { count: 'exact', head: true })
    .in('user_id', userIds)
    .eq('action', 'call')
    .gte('timestamp', monthStart.toISOString());

  // Total bookings this month (converted leads)
  const { count: totalBookings } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .in('assigned_to', userIds)
    .eq('status', 'converted')
    .gte('updated_at', monthStart.toISOString());

  // Conversions this month
  const conversions = totalBookings || 0;

  // Top performer
  const { data: topPerformers } = await supabase
    .from('users')
    .select('id, name, role')
    .in('id', userIds)
    .limit(1);

  let topPerformer = null;
  if (topPerformers && topPerformers.length > 0) {
    const performer = topPerformers[0];
    
    const { count: performerMeetings } = await supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', performer.id)
      .eq('status', 'completed')
      .gte('completed_at', monthStart.toISOString());

    const { count: performerVisits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', performer.id)
      .eq('status', 'completed')
      .gte('completed_at', monthStart.toISOString());

    topPerformer = {
      name: performer.name,
      role: performer.role,
      meetings: performerMeetings || 0,
      visits: performerVisits || 0
    };
  }

  // Client dropped (not_interested + spam)
  const clientsDropped = (statusCounts.not_interested || 0) + (statusCounts.spam || 0);

  // Service managers (managers)
  const serviceManagers = totalManagers;

  // Sales employees (employees)
  const salesEmployees = totalEmployees;

  // Recent leads (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: recentLeadsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString());

  return {
    overview: {
      totalLeads: totalLeads || 0,
      totalAdmins,
      totalManagers,
      totalEmployees,
      activeUsers
    },
    leadsByStatus: statusCounts,
    leadsByType: {
      websiteLeads,
      marketData
    },
    deletedLeads: deletedLeads || 0,
    thisMonth: {
      totalMeetings: totalMeetings || 0,
      totalVisits: totalVisits || 0,
      totalCalls: totalCalls || 0,
      totalBookings: totalBookings || 0,
      conversions
    },
    performance: {
      topPerformer
    },
    metrics: {
      clientsDropped,
      serviceManagers,
      salesEmployees,
      recentLeadsCount: recentLeadsCount || 0
    }
  };
};
