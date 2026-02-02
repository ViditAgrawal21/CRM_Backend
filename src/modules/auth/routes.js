import express from 'express';
import * as authController from './controller.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema } from './validator.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authController.loginController);

export default router;
