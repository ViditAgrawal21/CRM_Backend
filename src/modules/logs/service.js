import { supabase } from '../../config/supabase.js';

export const createLog = async (logData, userId) => {
  const { leadId, action, duration, templateId, outcome, notes } = logData;

  const { data, error } = await supabase
    .from('logs')
    .insert({
      lead_id: leadId,
      user_id: userId,
      action,
      duration,
      template_id: templateId,
      outcome,
      notes
    })
    .select(`
      *,
      lead:leads(id, name, phone),
      template:templates(id, title)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getLogs = async (userId, leadId = null) => {
  let query = supabase
    .from('logs')
    .select(`
      *,
      lead:leads(id, name, phone),
      template:templates(id, title)
    `)
    .eq('user_id', userId);

  if (leadId) {
    query = query.eq('lead_id', leadId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
