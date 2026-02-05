import bcrypt from 'bcrypt';
import { supabase } from '../../config/supabase.js';
import { getUserTeam, deactivateUserCascade } from '../../utils/hierarchy.js';

export const createUser = async (userData, creatorId, creatorRole) => {
  const { name, phone, password, role, monthlyMeetingTarget, monthlyVisitTarget, monthlyRevenueTarget, monthlyBonus } = userData;

  // Validation: Only owner can create admin
  if (role === 'admin' && creatorRole !== 'owner') {
    throw new Error('Only owner can create admins');
  }

  // Validation: Only admin can create manager/employee
  if ((role === 'manager' || role === 'employee') && !['owner', 'admin'].includes(creatorRole)) {
    throw new Error('Only admins can create managers and employees');
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Create user
  const { data, error } = await supabase
    .from('users')
    .insert({
      name,
      phone,
      password_hash,
      role,
      created_by: creatorId,
      monthly_meeting_target: monthlyMeetingTarget || 0,
      monthly_visit_target: monthlyVisitTarget || 0,
      monthly_revenue_target: monthlyRevenueTarget || 0,
      monthly_bonus: monthlyBonus || 0
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Phone number already exists');
    }
    throw error;
  }

  const { password_hash: _, ...userWithoutPassword } = data;
  return userWithoutPassword;
};

export const getTeam = async (userId) => {
  const team = await getUserTeam(userId);
  return team;
};

export const deactivateUser = async (targetUserId, requesterId) => {
  // Check if requester has access to target user
  const team = await getUserTeam(requesterId);
  const hasAccess = team.some(member => member.id === targetUserId);

  if (!hasAccess) {
    throw new Error('You do not have permission to deactivate this user');
  }

  // Deactivate user and all children
  await deactivateUserCascade(targetUserId);

  return { success: true };
};

export const activateUser = async (targetUserId, requesterId) => {
  // Check if requester has access to target user
  const team = await getUserTeam(requesterId);
  const hasAccess = team.some(member => member.id === targetUserId);

  if (!hasAccess) {
    throw new Error('You do not have permission to activate this user');
  }

  // Activate user (only the specific user, not children)
  const { error } = await supabase
    .from('users')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('id', targetUserId);

  if (error) throw error;

  return { success: true };
};
