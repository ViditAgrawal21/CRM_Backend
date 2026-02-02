import express from 'express';
import * as meetingsController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createMeetingSchema, updateMeetingSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createMeetingSchema), meetingsController.createMeetingController);
router.get('/', meetingsController.getMeetingsController);
router.patch('/:id', validate(updateMeetingSchema), meetingsController.updateMeetingController);

export default router;
