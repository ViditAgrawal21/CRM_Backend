import * as templatesService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createTemplateController = asyncHandler(async (req, res) => {
  const template = await templatesService.createTemplate(req.body, req.user.id, req.user.role);

  res.status(201).json({
    success: true,
    data: template
  });
});

export const getTemplatesController = asyncHandler(async (req, res) => {
  const templates = await templatesService.getTemplates();

  res.status(200).json({
    success: true,
    data: templates
  });
});

export const getTemplateByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const template = await templatesService.getTemplateById(id);

  res.status(200).json({
    success: true,
    data: template
  });
});

export const updateTemplateController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const template = await templatesService.updateTemplate(id, req.body, req.user.role);

  res.status(200).json({
    success: true,
    data: template
  });
});

export const deleteTemplateController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await templatesService.deleteTemplate(id, req.user.role);

  res.status(200).json({
    success: true,
    message: 'Template deleted successfully'
  });
});
