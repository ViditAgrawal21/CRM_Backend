import { supabase } from '../../config/supabase.js';

export const createTemplate = async (templateData, userId, userRole) => {
  // Only admin can create templates
  if (!['owner', 'admin'].includes(userRole)) {
    throw new Error('Only admins can create templates');
  }

  const { title, message } = templateData;

  const { data, error } = await supabase
    .from('templates')
    .insert({
      title,
      message,
      created_by: userId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTemplates = async () => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getTemplateById = async (templateId) => {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data;
};

export const updateTemplate = async (templateId, updateData, userRole) => {
  // Only admin can update templates
  if (!['owner', 'admin'].includes(userRole)) {
    throw new Error('Only admins can update templates');
  }

  const { data, error } = await supabase
    .from('templates')
    .update(updateData)
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTemplate = async (templateId, userRole) => {
  // Only admin can delete templates (soft delete)
  if (!['owner', 'admin'].includes(userRole)) {
    throw new Error('Only admins can delete templates');
  }

  const { data, error } = await supabase
    .from('templates')
    .update({ is_active: false })
    .eq('id', templateId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
