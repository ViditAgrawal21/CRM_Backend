import { supabase } from '../../config/supabase.js';

export const getDailyReport = async (userId, date) => {
  const reportDate = date || new Date().toISOString().split('T')[0];

  // Get today's stats
  const startOfDay = `${reportDate}T00:00:00Z`;
  const endOfDay = `${reportDate}T23:59:59Z`;

  // Total calls today
  const { count: totalCalls } = await supabase
    .from('logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', 'call')
    .gte('timestamp', startOfDay)
    .lte('timestamp', endOfDay);

  // Today's meetings
  const { count: todayMeetings } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', startOfDay)
    .lte('completed_at', endOfDay);

  // Today's visits
  const { count: todayVisits } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', startOfDay)
    .lte('completed_at', endOfDay);

  // Meetings till now (lifetime)
  const { count: meetingsTillNow } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Visits till now (lifetime)
  const { count: visitsTillNow } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed');

  // Prospects (leads with status 'prospect')
  const { data: prospects, count: prospectsTillNow } = await supabase
    .from('leads')
    .select('id, name, phone', { count: 'exact' })
    .eq('assigned_to', userId)
    .eq('status', 'prospect');

  const prospectsData = prospects?.map(p => ({ name: p.name, phone: p.phone })) || [];

  return {
    reportDate,
    totalCalls: totalCalls || 0,
    todayMeetings: todayMeetings || 0,
    todayVisits: todayVisits || 0,
    meetingsTillNow: meetingsTillNow || 0,
    visitsTillNow: visitsTillNow || 0,
    prospectsTillNow: prospectsTillNow || 0,
    prospects: prospectsData
  };
};

export const getMonthlyReport = async (userId, month) => {
  // month format: YYYY-MM-01
  const reportMonth = month || new Date().toISOString().substring(0, 8) + '01';

  // Get target for this month
  const { data: target } = await supabase
    .from('targets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', reportMonth)
    .single();

  if (!target) {
    return {
      month: reportMonth,
      message: 'No target set for this month',
      target: null,
      achievement: null
    };
  }

  // Get month range
  const monthStart = new Date(reportMonth);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);

  // Count completed meetings this month
  const { count: meetingsAchieved } = await supabase
    .from('meetings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', monthStart.toISOString())
    .lt('completed_at', monthEnd.toISOString());

  // Count completed visits this month
  const { count: visitsAchieved } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', monthStart.toISOString())
    .lt('completed_at', monthEnd.toISOString());

  const meetingProgress = target.meeting_target > 0 
    ? ((meetingsAchieved / target.meeting_target) * 100).toFixed(2) 
    : 0;
  
  const visitProgress = target.visit_target > 0 
    ? ((visitsAchieved / target.visit_target) * 100).toFixed(2) 
    : 0;

  const targetMet = meetingsAchieved >= target.meeting_target && 
                    visitsAchieved >= target.visit_target;

  return {
    month: reportMonth,
    target: {
      meetings: target.meeting_target,
      visits: target.visit_target,
      revenue: target.revenue_target,
      bonus: target.bonus
    },
    achievement: {
      meetings: meetingsAchieved || 0,
      visits: visitsAchieved || 0,
      meetingProgress: `${meetingProgress}%`,
      visitProgress: `${visitProgress}%`
    },
    targetMet,
    bonusApproved: target.bonus_approved,
    bonusApprovedAt: target.bonus_approved_at
  };
};

export const saveDailyReport = async (userId, reportData) => {
  const { reportDate, nextDayPlan } = reportData;

  const dailyStats = await getDailyReport(userId, reportDate);

  const { data, error } = await supabase
    .from('daily_reports')
    .upsert({
      user_id: userId,
      report_date: reportDate,
      total_calls: dailyStats.totalCalls,
      total_whatsapp: 0,
      total_templates: 0,
      total_meetings: dailyStats.todayMeetings,
      total_visits: dailyStats.todayVisits,
      next_day_plan: nextDayPlan
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
