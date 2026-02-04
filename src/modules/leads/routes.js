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

// Bulk upload leads (admin only) - JSON format
router.post('/bulk/upload', 
  authorize('owner', 'admin'), 
  leadsController.bulkUploadLeadsController
);

// Bulk upload leads (admin only) - CSV format
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

// Soft delete lead (all roles can delete their own leads)
router.delete('/:id/soft', 
  leadsController.softDeleteLeadController
);

// Get deleted leads (admin only)
router.get('/deleted', 
  authorize('owner', 'admin'), 
  leadsController.getDeletedLeadsController
);

// Restore deleted lead (admin only)
router.patch('/:id/restore', 
  authorize('owner', 'admin'), 
  leadsController.restoreLeadController
);

// Permanently delete lead (admin only)
router.delete('/:id/permanent', 
  authorize('owner', 'admin'), 
  leadsController.permanentDeleteLeadController
);

export default router;
