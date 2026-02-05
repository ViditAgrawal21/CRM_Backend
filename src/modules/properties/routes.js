import express from 'express';
import multer from 'multer';
import * as propertiesController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// Get all properties (all roles can view)
router.get('/', propertiesController.getPropertiesController);

// Get properties summary (all roles can view)
router.get('/summary', propertiesController.getPropertiesSummaryController);

// Bulk upload properties (owner only)
router.post('/bulk', 
  authorize('owner'), 
  upload.single('file'),
  propertiesController.bulkUploadPropertiesController
);

// Share property via WhatsApp (all roles)
router.post('/:id/share', propertiesController.sharePropertyController);

// Get single property (all roles can view)
router.get('/:id', propertiesController.getPropertyController);

// Create property (owner only)
router.post('/', 
  authorize('owner'), 
  propertiesController.createPropertyController
);

// Update property (owner only)
router.patch('/:id', 
  authorize('owner'), 
  propertiesController.updatePropertyController
);

// Delete property (owner only)
router.delete('/:id', 
  authorize('owner'), 
  propertiesController.deletePropertyController
);

export default router;
