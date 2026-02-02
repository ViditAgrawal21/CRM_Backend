import express from 'express';
import * as logsController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createLogSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createLogSchema), logsController.createLogController);
router.get('/', logsController.getLogsController);

export default router;
