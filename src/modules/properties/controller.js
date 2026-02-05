import * as propertiesService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// Get all properties (all roles can view)
export const getPropertiesController = asyncHandler(async (req, res) => {
  const properties = await propertiesService.getAllProperties();

  res.status(200).json({
    success: true,
    data: properties
  });
});

// Get single property by ID (all roles can view)
export const getPropertyController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await propertiesService.getPropertyById(id);

  res.status(200).json({
    success: true,
    data: property
  });
});

// Get properties summary (all roles can view)
export const getPropertiesSummaryController = asyncHandler(async (req, res) => {
  const summary = await propertiesService.getPropertiesSummary();

  res.status(200).json({
    success: true,
    data: summary
  });
});

// Create property (owner only)
export const createPropertyController = asyncHandler(async (req, res) => {
  const property = await propertiesService.createProperty(req.body);

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: property
  });
});

// Update property (owner only)
export const updatePropertyController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await propertiesService.updateProperty(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Property updated successfully',
    data: property
  });
});

// Delete property (owner only)
export const deletePropertyController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await propertiesService.deleteProperty(id);

  res.status(200).json({
    success: true,
    message: 'Property deleted successfully'
  });
});

// Bulk upload properties (owner only)
export const bulkUploadPropertiesController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Excel file is required'
    });
  }

  const result = await propertiesService.bulkUploadProperties(
    req.file.buffer,
    req.file.originalname
  );

  res.status(200).json({
    success: true,
    message: result.message,
    data: result
  });
});

// Share property via WhatsApp (all roles)
export const sharePropertyController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { leadId, phoneNumber } = req.body;

  if (!phoneNumber && !leadId) {
    return res.status(400).json({
      success: false,
      error: 'Either phoneNumber or leadId is required'
    });
  }

  let phone = phoneNumber;

  // If leadId is provided, fetch lead's phone number
  if (leadId) {
    const { supabase } = await import('../../config/supabase.js');
    const { data: lead, error } = await supabase
      .from('leads')
      .select('phone')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return res.status(404).json({
        success: false,
        error: 'Lead not found'
      });
    }

    phone = lead.phone;
  }

  const result = await propertiesService.generateWhatsAppShareLink(id, phone);

  res.status(200).json({
    success: true,
    message: 'WhatsApp share link generated',
    data: result
  });
});
