import * as meetingsService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createMeetingController = asyncHandler(async (req, res) => {
  const meeting = await meetingsService.createMeeting(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: meeting
  });
});

export const getMeetingsController = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const meetings = await meetingsService.getMeetings(req.user.id, status);

  res.status(200).json({
    success: true,
    data: meetings
  });
});

export const updateMeetingController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const meeting = await meetingsService.updateMeeting(id, req.body, req.user.id);

  res.status(200).json({
    success: true,
    data: meeting
  });
});
