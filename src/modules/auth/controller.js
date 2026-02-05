import * as authService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const initializeOwnerController = asyncHandler(async (req, res) => {
  const { name, phone, password } = req.body;
  const result = await authService.initializeOwner(name, phone, password);
  
  res.status(201).json({
    success: true,
    message: 'Owner account created successfully',
    data: result
  });
});

export const loginController = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const result = await authService.login(phone, password);

  res.status(200).json({
    success: true,
    data: result
  });
});
