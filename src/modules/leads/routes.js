import express from 'express';
import * as leadsController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createLeadSchema, updateLeadSchema, assignLeadSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

// Create single lead (admin only)
router.post('/', 
  authorize('owner', 'admin'), 
  validate(createLeadSchema), 
  leadsController.createLeadController
);

// Bulk upload leads (admin only)
router.post('/bulk', 
  authorize('owner', 'admin'), 
  leadsController.bulkCreateLeadsController
);

// Get leads
router.get('/', leadsController.getLeadsController);

// Update lead
router.patch('/:id', 
  validate(updateLeadSchema), 
  leadsController.updateLeadController
);

// Assign lead
router.post('/assign', 
  authorize('owner', 'admin', 'manager'), 
  validate(assignLeadSchema), 
  leadsController.assignLeadController
);

export default router;
