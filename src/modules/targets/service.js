import { supabase } from '../../config/supabase.js';
import { getUserTeam } from '../../utils/hierarchy.js';

export const setTarget = async (targetData, adminId, adminRole) => {
  console.log('setTarget called with:', { targetData, adminId, adminRole });
  
  // Only admin can set targets
  if (!['owner', 'admin'].includes(adminRole)) {
    throw new Error('Only admins can set targets');
  }

  const { userId, month, meetingTarget, visitTarget, revenueTarget, bonus } = targetData;
  
  console.log('Attempting to upsert target:', { userId, month, meetingTarget, visitTarget, revenueTarget, bonus });

  // Upsert target - simplified, skip team validation for now
  const { data, error } = await supabase
    .from('targets')
    .upsert({
      user_id: userId,
      month,
      meeting_target: meetingTarget,
      visit_target: visitTarget,
      revenue_target: revenueTarget,
      bonus
    }, { onConflict: 'user_id,month' })
    .select('id, user_id, month, meeting_target, visit_target, revenue_target, bonus, created_at')
    .single();

  if (error) {
    console.error('Supabase error in setTarget:', JSON.stringify(error, null, 2));
    throw new Error(`Failed to set target: ${error.message || JSON.stringify(error)}`);
  }
  
  console.log('Target set successfully:', data);
  return data;
};

export const getTargets = async (userId, month = null) => {
  let query = supabase
    .from('targets')
    .select('*')
    .eq('user_id', userId);

  if (month) {
    query = query.eq('month', month);
  }

  const { data, error } = await query.order('month', { ascending: false });

  if (error) {
    console.error('Supabase error in getTargets:', error);
    throw new Error(`Failed to get targets: ${error.message}`);
  }
  return data || [];
};

export const getTeamTargets = async (adminId, month) => {
  const team = await getUserTeam(adminId);
  const userIds = team.map(member => member.id);

  let query = supabase
    .from('targets')
    .select(`
      *,
      user:users!targets_user_id_fkey(id, name, role, phone)
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
