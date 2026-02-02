import express from 'express';
import * as targetsController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { setTargetSchema, approveBonusSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

// Set target for team member
router.post('/', 
  authorize('owner', 'admin'), 
  validate(setTargetSchema), 
  targetsController.setTargetController
);

// Get own targets
router.get('/', targetsController.getTargetsController);

// Get team targets (admin only)
router.get('/team', 
  authorize('owner', 'admin'), 
  targetsController.getTeamTargetsController
);

// Approve bonus
router.post('/approve-bonus', 
  authorize('owner', 'admin'), 
  validate(approveBonusSchema), 
  targetsController.approveBonusController
);

// Update achievements (run periodically)
router.post('/update-achievements', 
  targetsController.updateAchievementsController
);

export default router;
