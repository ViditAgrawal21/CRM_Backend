import * as usersService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createUserController = asyncHandler(async (req, res) => {
  const user = await usersService.createUser(req.body, req.user.id, req.user.role);

  res.status(201).json({
    success: true,
    data: user
  });
});

export const getTeamController = asyncHandler(async (req, res) => {
  const team = await usersService.getTeam(req.user.id);

  res.status(200).json({
    success: true,
    data: team
  });
});

export const deactivateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await usersService.deactivateUser(id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'User and their team deactivated successfully',
    data: result
  });
});
