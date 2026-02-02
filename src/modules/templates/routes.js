import express from 'express';
import * as templatesController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createTemplateSchema, updateTemplateSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', 
  authorize('owner', 'admin'), 
  validate(createTemplateSchema), 
  templatesController.createTemplateController
);

router.get('/', templatesController.getTemplatesController);
router.get('/:id', templatesController.getTemplateByIdController);

router.patch('/:id', 
  authorize('owner', 'admin'), 
  validate(updateTemplateSchema), 
  templatesController.updateTemplateController
);

router.delete('/:id', 
  authorize('owner', 'admin'), 
  templatesController.deleteTemplateController
);

export default router;
