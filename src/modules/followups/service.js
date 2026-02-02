import { supabase } from '../../config/supabase.js';

export const createFollowup = async (followupData, userId) => {
  const { leadId, reminderAt, notes } = followupData;

  const { data, error } = await supabase
    .from('followups')
    .insert({
      lead_id: leadId,
      user_id: userId,
      reminder_at: reminderAt,
      notes
    })
    .select(`
      *,
      lead:leads(id, name, phone, status)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getTodayFollowups = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('followups')
    .select(`
      *,
      lead:leads(id, name, phone, status, configuration, location)
    `)
    .eq('user_id', userId)
    .gte('reminder_at', today.toISOString())
    .lt('reminder_at', tomorrow.toISOString())
    .order('reminder_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const getBacklog = async (userId) => {
  // Auto-mark missed followups first
  await supabase.rpc('mark_missed_followups');

  const { data, error } = await supabase
    .from('followups')
    .select(`
      *,
      lead:leads(id, name, phone, status, configuration, location)
    `)
    .eq('user_id', userId)
    .eq('status', 'missed')
    .order('reminder_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateFollowup = async (followupId, updateData, userId) => {
  const completedAt = updateData.status === 'done' ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('followups')
    .update({
      ...updateData,
      completed_at: completedAt
    })
    .eq('id', followupId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
