import * as visitsService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createVisitController = asyncHandler(async (req, res) => {
  const visit = await visitsService.createVisit(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: visit
  });
});

export const getVisitsController = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const visits = await visitsService.getVisits(req.user.id, status);

  res.status(200).json({
    success: true,
    data: visits
  });
});

export const updateVisitController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const visit = await visitsService.updateVisit(id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    data: visit
  });
});
