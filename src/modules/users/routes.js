import express from 'express';
import * as usersController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createUserSchema } from './validator.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create user (owner creates admin, admin creates manager/employee)
router.post('/', 
  authorize('owner', 'admin'), 
  validate(createUserSchema), 
  usersController.createUserController
);

// Get team hierarchy
router.get('/team', usersController.getTeamController);

// Deactivate user and their children
router.patch('/deactivate/:id', 
  authorize('owner', 'admin', 'manager'), 
  usersController.deactivateUserController
);

// Activate user (owner/admin only)
router.patch('/activate/:id', 
  authorize('owner', 'admin', 'manager'), 
  usersController.activateUserController
);

export default router;
