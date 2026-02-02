import * as authService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const loginController = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const result = await authService.login(phone, password);

  res.status(200).json({
    success: true,
    data: result
  });
});
