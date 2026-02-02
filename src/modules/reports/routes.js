import express from 'express';
import * as reportsController from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/daily', reportsController.getDailyReportController);
router.get('/monthly', reportsController.getMonthlyReportController);
router.post('/daily', reportsController.saveDailyReportController);

export default router;
