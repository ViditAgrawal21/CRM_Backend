import * as propertiesService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getPropertiesController = asyncHandler(async (req, res) => {
  const filters = req.query;
  const properties = await propertiesService.fetchProperties(filters);

  res.status(200).json({
    success: true,
    data: properties
  });
});

export const createPropertyController = asyncHandler(async (req, res) => {
  const property = await propertiesService.createProperty(req.body, req.user.role);

  res.status(201).json({
    success: true,
    data: property
  });
});

export const bulkCreatePropertiesController = asyncHandler(async (req, res) => {
  const { csvContent } = req.body;

  if (!csvContent) {
    return res.status(400).json({ error: 'CSV content is required' });
  }

  const results = await propertiesService.bulkCreateProperties(csvContent, req.user.role);

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
