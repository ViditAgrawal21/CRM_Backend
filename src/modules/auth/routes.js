import express from 'express';
import * as authController from './controller.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema, initializeOwnerSchema } from './validator.js';

const router = express.Router();

router.post('/initialize-owner', validate(initializeOwnerSchema), authController.initializeOwnerController);
router.post('/login', validate(loginSchema), authController.loginController);

export default router;
