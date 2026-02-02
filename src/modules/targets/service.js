import { supabase } from '../../config/supabase.js';
import { getUserTeam } from '../../utils/hierarchy.js';

export const setTarget = async (targetData, adminId, adminRole) => {
  // Only admin can set targets
  if (!['owner', 'admin'].includes(adminRole)) {
    throw new Error('Only admins can set targets');
  }

  const { userId, month, meetingTarget, visitTarget, revenueTarget, bonus } = targetData;

  // Verify user is in admin's team
  const team = await getUserTeam(adminId);
  const hasAccess = team.some(member => member.id === userId);

  if (!hasAccess) {
    throw new Error('Cannot set target for user outside your team');
  }

  // Upsert target
  const { data, error } = await supabase
    .from('targets')
    .upsert({
      user_id: userId,
      month,
      meeting_target: meetingTarget,
      visit_target: visitTarget,
      revenue_target: revenueTarget,
      bonus
    })
    .select(`
      *,
      user:users(id, name, role)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getTargets = async (userId, month = null) => {
  let query = supabase
    .from('targets')
    .select(`
      *,
      user:users(id, name, role)
    `)
    .eq('user_id', userId);

  if (month) {
    query = query.eq('month', month);
  }

  const { data, error } = await query.order('month', { ascending: false });

  if (error) throw error;
  return data;
};

export const getTeamTargets = async (adminId, month) => {
  const team = await getUserTeam(adminId);
  const userIds = team.map(member => member.id);

  let query = supabase
    .from('targets')
    .select(`
      *,
      user:users(id, name, role, phone)
    `)
    .in('user_id', userIds);

  if (month) {
    query = query.eq('month', month);
  }

  const { data, error } = await query.order('month', { ascending: false });

  if (error) throw error;
  return data;
};

export const approveBonus = async (targetId, approverId) => {
  const { data, error } = await supabase
    .from('targets')
    .update({
      bonus_approved: true,
      bonus_approved_by: approverId,
      bonus_approved_at: new Date().toISOString()
    })
    .eq('id', targetId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateAchievements = async () => {
  // Call stored procedure to update achievements
  const { error } = await supabase.rpc('update_target_achievements');
  if (error) throw error;
  return { success: true };
};
