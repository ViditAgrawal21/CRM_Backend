import express from 'express';
import * as followupsController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createFollowupSchema, updateFollowupSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createFollowupSchema), followupsController.createFollowupController);
router.get('/today', followupsController.getTodayFollowupsController);
router.get('/backlog', followupsController.getBacklogController);
router.patch('/:id', validate(updateFollowupSchema), followupsController.updateFollowupController);

export default router;
