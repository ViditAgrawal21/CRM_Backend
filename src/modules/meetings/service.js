import { supabase } from '../../config/supabase.js';

export const createMeeting = async (meetingData, userId) => {
  const { leadId, scheduledAt, location, notes, remark } = meetingData;

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      lead_id: leadId,
      user_id: userId,
      scheduled_at: scheduledAt,
      location,
      notes,
      remark
    })
    .select(`
      *,
      lead:leads(id, name, phone, configuration)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getMeetings = async (userId, userRole, status = null) => {
  let query = supabase
    .from('meetings')
    .select(`
      *,
      lead:leads(id, name, phone, configuration, location),
      user:user_id(id, name, phone, role)
    `);

  // Owner sees all scheduled meetings in their team hierarchy
  if (userRole === 'owner') {
    if (status) {
      query = query.eq('status', status);
    }
  } else {
    // Other users see only their own meetings
    query = query.eq('user_id', userId);
    if (status) {
      query = query.eq('status', status);
    }
  }

  const { data, error } = await query.order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateMeeting = async (meetingId, updateData, userId) => {
  const completedAt = updateData.status === 'completed' ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('meetings')
    .update({
      ...updateData,
      completed_at: completedAt
    })
    .eq('id', meetingId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
