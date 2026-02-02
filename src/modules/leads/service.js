import { supabase } from '../../config/supabase.js';
import { getUserTeam } from '../../utils/hierarchy.js';
import { parse } from 'csv-parse/sync';

export const createLead = async (leadData, creatorId, creatorRole) => {
  // Only admin can create leads
  if (!['owner', 'admin'].includes(creatorRole)) {
    throw new Error('Only admins can create leads');
  }

  const { type, date, name, phone, configuration, location, remark, assignedTo } = leadData;

  // If assignedTo is provided, verify it's in creator's team
  if (assignedTo) {
    const team = await getUserTeam(creatorId);
    const hasAccess = team.some(member => member.id === assignedTo);
    if (!hasAccess) {
      throw new Error('Cannot assign to user outside your team');
    }
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      type,
      date,
      name,
      phone,
      configuration,
      location,
      remark,
      assigned_to: assignedTo || null,
      assigned_at: assignedTo ? new Date().toISOString() : null,
      created_by: creatorId
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const bulkCreateLeads = async (csvContent, creatorId, creatorRole) => {
  // Only admin can create leads
  if (!['owner', 'admin'].includes(creatorRole)) {
    throw new Error('Only admins can create leads');
  }

  // Parse CSV
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  const team = await getUserTeam(creatorId);
  const results = [];

  for (const record of records) {
    try {
      let assignedToId = null;

      // If "Assign to" column has a phone number, find the user
      if (record['Assign to']) {
        const assignedUser = team.find(member => member.phone === record['Assign to']);
        assignedToId = assignedUser?.id || null;
      }

      const { data, error } = await supabase
        .from('leads')
        .insert({
          type: record.Type || 'lead',
          date: record.Date,
          name: record['Customer Name'],
          phone: record['Customer Number'],
          configuration: record.Configuration || null,
          remark: record.Remark || null,
          assigned_to: assignedToId,
          assigned_at: assignedToId ? new Date().toISOString() : null,
          created_by: creatorId
        })
        .select()
        .single();

      if (error) {
        results.push({ success: false, error: error.message, record });
      } else {
        results.push({ success: true, data });
      }
    } catch (err) {
      results.push({ success: false, error: err.message, record });
    }
  }

  return results;
};

export const getLeads = async (userId, userRole) => {
  let query = supabase
    .from('leads')
    .select(`
      *,
      assigned_to_user:assigned_to(id, name, phone),
      created_by_user:created_by(id, name, phone)
    `);

  // Admins see all leads they created
  if (userRole === 'admin') {
    query = query.eq('created_by', userId);
  } else if (userRole === 'owner') {
    // Owner sees everything
  } else {
    // Managers and employees see only assigned to them
    query = query.eq('assigned_to', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const updateLead = async (leadId, updateData, userId) => {
  // Check if user has access to this lead
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('assigned_to, created_by')
    .eq('id', leadId)
    .single();

  if (fetchError || !lead) {
    throw new Error('Lead not found');
  }

  if (lead.assigned_to !== userId && lead.created_by !== userId) {
    throw new Error('You do not have permission to update this lead');
  }

  const { data, error } = await supabase
    .from('leads')
    .update(updateData)
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const assignLead = async (leadId, assignedTo, assignerId) => {
  // Verify assignee is in assigner's team
  const team = await getUserTeam(assignerId);
  const hasAccess = team.some(member => member.id === assignedTo);

  if (!hasAccess) {
    throw new Error('Cannot assign to user outside your team');
  }

  const { data, error } = await supabase
    .from('leads')
    .update({
      assigned_to: assignedTo,
      assigned_at: new Date().toISOString()
    })
    .eq('id', leadId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
