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

  // If remark was updated, sync it to meetings/visits
  if (updateData.remark) {
    try {
      await syncRemarkToMeetingsAndVisits(leadId, updateData.remark);
    } catch (syncError) {
      console.error('Error syncing remark to meetings/visits:', syncError);
      // Don't throw - the lead update succeeded, sync is bonus
    }
  }

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

// Bulk upload leads from JSON records (with duplicate detection)
export const bulkUploadLeads = async (uploadData, userId, userRole) => {
  // Only admin can upload
  if (!['owner', 'admin'].includes(userRole)) {
    throw new Error('Only admins can upload leads');
  }

  const { type, date, records } = uploadData;

  if (!records || records.length === 0) {
    throw new Error('Records array is required');
  }

  if (records.length > 1000) {
    throw new Error('Maximum 1000 records per upload');
  }

  // Validate type
  if (!['lead', 'data'].includes(type)) {
    throw new Error('Type must be either "lead" or "data"');
  }

  const team = await getUserTeam(userId);
  const results = {
    uploadId: null,
    total: records.length,
    inserted: 0,
    duplicates: 0,
    errors: 0,
    errorDetails: [],
    duplicateDetails: []
  };

  // Create upload record
  const { data: uploadRecord, error: uploadError } = await supabase
    .from('lead_uploads')
    .insert({
      user_id: userId,
      upload_type: type,
      total_records: records.length,
      status: 'processing'
    })
    .select()
    .single();

  if (uploadError) throw uploadError;
  results.uploadId = uploadRecord.id;

  // Process records
  for (let i = 0; i < records.length; i++) {
    try {
      const record = records[i];

      // Validate required fields
      if (!record.customerName || !record.customerNumber) {
        results.errors++;
        results.errorDetails.push({
          recordIndex: i,
          phone: record.customerNumber,
          reason: 'Customer name and number are required'
        });
        continue;
      }

      // Validate phone format (10 digits)
      if (!/^\d{10}$/.test(record.customerNumber)) {
        results.errors++;
        results.errorDetails.push({
          recordIndex: i,
          phone: record.customerNumber,
          reason: 'Phone must be 10 digits'
        });
        continue;
      }

      // Check for duplicates
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', record.customerNumber)
        .single();

      if (existingLead) {
        results.duplicates++;
        results.duplicateDetails.push({
          recordIndex: i,
          phone: record.customerNumber,
          name: record.customerName
        });
        continue;
      }

      // Resolve assignTo user ID if provided
      let assignedToId = null;
      if (record.assignTo) {
        const assignedUser = team.find(
          member => member.phone === record.assignTo || member.id === record.assignTo
        );
        assignedToId = assignedUser?.id || null;
      }

      // Insert lead
      const { error: insertError } = await supabase
        .from('leads')
        .insert({
          type,
          date: date || new Date().toISOString().split('T')[0],
          name: record.customerName,
          phone: record.customerNumber,
          configuration: record.configuration || null,
          location: record.location || null,
          remark: record.remark || null,
          assigned_to: assignedToId,
          assigned_at: assignedToId ? new Date().toISOString() : null,
          created_by: userId,
          uploaded_by: userId,
          upload_batch_id: uploadRecord.id,
          is_uploaded_record: true
        });

      if (insertError) {
        results.errors++;
        results.errorDetails.push({
          recordIndex: i,
          phone: record.customerNumber,
          reason: insertError.message
        });
      } else {
        results.inserted++;
      }
    } catch (err) {
      results.errors++;
      results.errorDetails.push({
        recordIndex: i,
        reason: err.message
      });
    }
  }

  // Update upload record with results
  await supabase
    .from('lead_uploads')
    .update({
      inserted: results.inserted,
      duplicates: results.duplicates,
      error_count: results.errors,
      error_details: results.errorDetails,
      status: 'completed'
    })
    .eq('id', uploadRecord.id);

  return results;
};

// Sync remark to related meetings/visits when remark is updated
export const syncRemarkToMeetingsAndVisits = async (leadId, remark) => {
  if (!remark) return;

  // Check if remark mentions "meeting" or "visit"
  const remarkLower = remark.toLowerCase();
  const isMeetingRemark = remarkLower.includes('meeting');
  const isVisitRemark = remarkLower.includes('visit');

  // Extract scheduled time from remark (e.g., "5th Feb at 2 PM")
  // Simple pattern: look for date/time patterns
  const scheduledTime = extractScheduledTime(remark);

  if (isMeetingRemark && scheduledTime) {
    // Update all non-completed meetings for this lead with remark and reschedule
    const { data: meetings, error: meetingsFetchError } = await supabase
      .from('meetings')
      .select('id, user_id')
      .eq('lead_id', leadId)
      .neq('status', 'completed');

    if (!meetingsFetchError && meetings && meetings.length > 0) {
      for (const meeting of meetings) {
        await supabase
          .from('meetings')
          .update({
            remark,
            scheduled_at: scheduledTime,
            status: 'scheduled'
          })
          .eq('id', meeting.id);
      }
    }
  }

  if (isVisitRemark && scheduledTime) {
    // Update all non-completed visits for this lead with remark and reschedule
    const { data: visits, error: visitsFetchError } = await supabase
      .from('visits')
      .select('id, user_id')
      .eq('lead_id', leadId)
      .neq('status', 'completed');

    if (!visitsFetchError && visits && visits.length > 0) {
      for (const visit of visits) {
        await supabase
          .from('visits')
          .update({
            remark,
            scheduled_at: scheduledTime,
            status: 'scheduled'
          })
          .eq('id', visit.id);
      }
    }
  }
};

// Helper function to extract scheduled time from remark text
export const extractScheduledTime = (remarkText) => {
  if (!remarkText) return null;

  // Try to parse common date/time formats
  // Examples: "5th Feb at 2 PM", "5/2 at 14:00", "Feb 5 2:00 PM"
  
  // Simple regex patterns for common formats
  const patterns = [
    // "5th Feb at 2 PM" or "5 Feb at 2 PM"
    /(\d{1,2})(?:st|nd|rd|th)?\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+at\s+(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i,
    // "Feb 5 at 2 PM" or "Feb 5, 2025 at 2 PM"
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})(?:,?\s+\d{4})?\s+at\s+(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i,
    // "5/2/2025 at 2 PM" or "5/2 at 2 PM"
    /(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?\s+at\s+(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i,
    // "tomorrow at 2 PM", "today at 2 PM"
    /(today|tomorrow)\s+at\s+(\d{1,2}):?(\d{2})?\s*(AM|PM|am|pm)?/i
  ];

  for (const pattern of patterns) {
    const match = remarkText.match(pattern);
    if (match) {
      try {
        return parseRemarkedDateTime(match);
      } catch (e) {
        continue;
      }
    }
  }

  return null;
};

// Helper function to parse matched date/time
const parseRemarkedDateTime = (match) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Month mapping
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };

  let date, month, day, time;

  // Check if it's "today" or "tomorrow"
  if (match[1]?.toLowerCase() === 'today') {
    date = new Date(now);
  } else if (match[1]?.toLowerCase() === 'tomorrow') {
    date = new Date(now);
    date.setDate(date.getDate() + 1);
  } else if (monthMap[match[1]?.substring(0, 3).charAt(0).toUpperCase() + match[1]?.substring(1, 3).toLowerCase()]) {
    // Month format: "5th Feb at 2 PM"
    const monthKey = match[1]?.substring(0, 3);
    month = monthMap[monthKey];
    day = parseInt(match[1]);
    date = new Date(currentYear, month, day);
  } else if (monthMap[match[1]]) {
    // Month format: "Feb 5 at 2 PM"
    month = monthMap[match[1]];
    day = parseInt(match[2]);
    const year = match[3] ? parseInt(match[3]) : currentYear;
    date = new Date(year, month, day);
  } else if (match[1] && match[2]) {
    // Date format: "5/2/2025 at 2 PM"
    day = parseInt(match[1]);
    month = parseInt(match[2]) - 1;
    const year = match[3] ? parseInt(match[3]) : currentYear;
    date = new Date(year, month, day);
  }

  if (!date) return null;

  // Parse time
  const hour = match[match.length - 3] ? parseInt(match[match.length - 3]) : 0;
  const minute = match[match.length - 2] ? parseInt(match[match.length - 2]) : 0;
  const meridiem = match[match.length - 1];

  let finalHour = hour;
  if (meridiem && meridiem.toUpperCase() === 'PM' && hour !== 12) {
    finalHour = hour + 12;
  } else if (meridiem && meridiem.toUpperCase() === 'AM' && hour === 12) {
    finalHour = 0;
  }

  date.setHours(finalHour, minute, 0, 0);

  return date.toISOString();
};
