import express from 'express';
import * as dashboardController from './controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', dashboardController.getDashboardStatsController);

export default router;
