import * as leadsService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createLeadController = asyncHandler(async (req, res) => {
  const lead = await leadsService.createLead(req.body, req.user.id, req.user.role);

  res.status(201).json({
    success: true,
    data: lead
  });
});

export const bulkCreateLeadsController = asyncHandler(async (req, res) => {
  const { csvContent } = req.body;

  if (!csvContent) {
    return res.status(400).json({ error: 'CSV content is required' });
  }

  const results = await leadsService.bulkCreateLeads(csvContent, req.user.id, req.user.role);

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  res.status(200).json({
    success: true,
    data: {
      total: results.length,
      success: successCount,
      failed: failCount,
      results
    }
  });
});

export const getLeadsController = asyncHandler(async (req, res) => {
  // Extract filters from query parameters
  const filters = {
    type: req.query.type, // 'lead' or 'data'
    status: req.query.status // 'new', 'contacted', etc.
  };

  const leads = await leadsService.getLeads(req.user.id, req.user.role, filters);

  res.status(200).json({
    success: true,
    data: leads
  });
});

export const updateLeadController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await leadsService.updateLead(id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    data: lead
  });
});

export const assignLeadController = asyncHandler(async (req, res) => {
  const { leadId, assignedTo } = req.body;

  const lead = await leadsService.assignLead(leadId, assignedTo, req.user.id);

  res.status(200).json({
    success: true,
    data: lead
  });
});

export const bulkUploadLeadsController = asyncHandler(async (req, res) => {
  const result = await leadsService.bulkUploadLeads(req.body, req.user.id, req.user.role);

  res.status(201).json({
    success: true,
    data: result
  });
});

export const softDeleteLeadController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await leadsService.softDeleteLead(id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Lead moved to trash',
    data: lead
  });
});

export const getDeletedLeadsController = asyncHandler(async (req, res) => {
  const leads = await leadsService.getDeletedLeads(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: leads
  });
});

export const restoreLeadController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const lead = await leadsService.restoreLead(id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Lead restored successfully',
    data: lead
  });
});

export const permanentDeleteLeadController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await leadsService.permanentDeleteLead(id, req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Lead permanently deleted',
    data: result
  });
});
