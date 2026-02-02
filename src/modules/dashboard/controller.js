import * as dashboardService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getDashboardStatsController = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.id, req.user.role);

  res.status(200).json({
    success: true,
    data: stats
  });
});
