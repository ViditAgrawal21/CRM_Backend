import * as followupsService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createFollowupController = asyncHandler(async (req, res) => {
  const followup = await followupsService.createFollowup(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: followup
  });
});

export const getTodayFollowupsController = asyncHandler(async (req, res) => {
  const followups = await followupsService.getTodayFollowups(req.user.id);

  res.status(200).json({
    success: true,
    data: followups
  });
});

export const getBacklogController = asyncHandler(async (req, res) => {
  const backlog = await followupsService.getBacklog(req.user.id);

  res.status(200).json({
    success: true,
    data: backlog
  });
});

export const updateFollowupController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const followup = await followupsService.updateFollowup(id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    data: followup
  });
});
