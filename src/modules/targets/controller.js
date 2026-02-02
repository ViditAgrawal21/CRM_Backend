import * as targetsService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const setTargetController = asyncHandler(async (req, res) => {
  const target = await targetsService.setTarget(req.body, req.user.id, req.user.role);

  res.status(201).json({
    success: true,
    data: target
  });
});

export const getTargetsController = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const targets = await targetsService.getTargets(req.user.id, month);

  res.status(200).json({
    success: true,
    data: targets
  });
});

export const getTeamTargetsController = asyncHandler(async (req, res) => {
  const { month } = req.query;
  const targets = await targetsService.getTeamTargets(req.user.id, month);

  res.status(200).json({
    success: true,
    data: targets
  });
});

export const approveBonusController = asyncHandler(async (req, res) => {
  const { targetId } = req.body;
  const target = await targetsService.approveBonus(targetId, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Bonus approved successfully',
    data: target
  });
});

export const updateAchievementsController = asyncHandler(async (req, res) => {
  const result = await targetsService.updateAchievements();

  res.status(200).json({
    success: true,
    message: 'Achievements updated successfully',
    data: result
  });
});
