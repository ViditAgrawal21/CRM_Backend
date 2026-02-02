import express from 'express';
import * as propertiesController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createPropertySchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

// Fetch properties from external API (all roles can view)
router.get('/', propertiesController.getPropertiesController);

// Create property (owner only)
router.post('/', 
  authorize('owner'), 
  validate(createPropertySchema), 
  propertiesController.createPropertyController
);

// Bulk upload properties (owner only)
router.post('/bulk', 
  authorize('owner'), 
  propertiesController.bulkCreatePropertiesController
);

export default router;
