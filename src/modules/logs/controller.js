import * as logsService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createLogController = asyncHandler(async (req, res) => {
  const log = await logsService.createLog(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: log
  });
});

export const getLogsController = asyncHandler(async (req, res) => {
  const { leadId } = req.query;
  const logs = await logsService.getLogs(req.user.id, leadId);

  res.status(200).json({
    success: true,
    data: logs
  });
});
