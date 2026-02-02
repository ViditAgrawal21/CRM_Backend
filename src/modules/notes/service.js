import { supabase } from '../../config/supabase.js';

export const createNote = async (noteData, userId) => {
  const { leadId, text } = noteData;

  const { data, error } = await supabase
    .from('notes')
    .insert({
      lead_id: leadId,
      user_id: userId,
      text
    })
    .select(`
      *,
      lead:leads(id, name, phone),
      user:users(id, name)
    `)
    .single();

  if (error) throw error;
  return data;
};

export const getNotes = async (leadId) => {
  const { data, error } = await supabase
    .from('notes')
    .select(`
      *,
      user:users(id, name)
    `)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
