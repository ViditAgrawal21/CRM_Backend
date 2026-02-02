import { supabase } from '../../config/supabase.js';

export const createVisit = async (visitData, userId) => {
  const { leadId, scheduledAt, siteLocation, notes } = visitData;

  const { data, error } = await supabase
    .from('visits')
    .insert({
      lead_id: leadId,
      user_id: userId,
      scheduled_at: scheduledAt,
      site_location: siteLocation,
      notes
    })
    .select(`
      *,
      lead:leads(id, name, phone, configuration)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getVisits = async (userId, status = null) => {
  let query = supabase
    .from('visits')
    .select(`
      *,
      lead:leads(id, name, phone, configuration, location)
    `)
    .eq('user_id', userId);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateVisit = async (visitId, updateData, userId) => {
  const completedAt = updateData.status === 'completed' ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from('visits')
    .update({
      ...updateData,
      completed_at: completedAt
    })
    .eq('id', visitId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
