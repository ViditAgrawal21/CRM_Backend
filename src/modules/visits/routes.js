import express from 'express';
import * as visitsController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createVisitSchema, updateVisitSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createVisitSchema), visitsController.createVisitController);
router.get('/', visitsController.getVisitsController);
router.patch('/:id', validate(updateVisitSchema), visitsController.updateVisitController);

export default router;
