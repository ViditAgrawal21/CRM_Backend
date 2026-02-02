import { supabase } from '../config/supabase.js';

export const getUserTeam = async (userId) => {
  const { data, error } = await supabase.rpc('get_user_team', {
    user_uuid: userId
  });

  if (error) throw error;
  return data;
};

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
