import * as reportsService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getDailyReportController = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const report = await reportsService.getDailyReport(req.user.id, date);

  res.status(200).json({
    success: true,
    data: report
  });
});

export const getMonthlyReportController = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const report = await reportsService.getMonthlyReport(req.user.id, month);

  res.status(200).json({
    success: true,
    data: report
  });
});

export const saveDailyReportController = asyncHandler(async (req, res) => {
  const report = await reportsService.saveDailyReport(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Daily report saved and shared successfully',
    data: report
  });
});
