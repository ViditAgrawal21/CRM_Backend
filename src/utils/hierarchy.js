import { supabase } from '../config/supabase.js';

export const getUserTeam = async (userId) => {
  // Get all users where parent chain includes userId
  const allUsers = [];
  
  // Start with the user themselves
  const { data: currentUser } = await supabase
    .from('users')
    .select('id, name, phone, role, parent_id, is_active')
    .eq('id', userId)
    .single();
  
  if (currentUser) {
    allUsers.push(currentUser);
    
    // Get direct reports recursively
    await getDirectReports(userId, allUsers);
  }
  
  return allUsers;
};

async function getDirectReports(parentId, accumulator) {
  const { data: reports } = await supabase
    .from('users')
    .select('id, name, phone, role, parent_id, is_active')
    .eq('parent_id', parentId);
  
  if (reports && reports.length > 0) {
    accumulator.push(...reports);
    
    // Recursively get their reports
    for (const report of reports) {
      await getDirectReports(report.id, accumulator);
    }
  }
}

export const deactivateUserCascade = async (userId) => {
  const { error } = await supabase.rpc('deactivate_user_cascade', {
    user_uuid: userId
  });

  if (error) throw error;
};

export const canAccessUser = async (requesterId, targetId) => {
  const team = await getUserTeam(requesterId);
  return team.some(member => member.id === targetId);
};
