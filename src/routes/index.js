import express from 'express';
import authRoutes from '../modules/auth/routes.js';
import usersRoutes from '../modules/users/routes.js';
import leadsRoutes from '../modules/leads/routes.js';
import followupsRoutes from '../modules/followups/routes.js';
import meetingsRoutes from '../modules/meetings/routes.js';
import visitsRoutes from '../modules/visits/routes.js';
import logsRoutes from '../modules/logs/routes.js';
import notesRoutes from '../modules/notes/routes.js';
import templatesRoutes from '../modules/templates/routes.js';
import targetsRoutes from '../modules/targets/routes.js';
import reportsRoutes from '../modules/reports/routes.js';
import dashboardRoutes from '../modules/dashboard/routes.js';
import propertiesRoutes from '../modules/properties/routes.js';

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/leads', leadsRoutes);
router.use('/followups', followupsRoutes);
router.use('/meetings', meetingsRoutes);
router.use('/visits', visitsRoutes);
router.use('/logs', logsRoutes);
router.use('/notes', notesRoutes);
router.use('/templates', templatesRoutes);
router.use('/targets', targetsRoutes);
router.use('/reports', reportsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/properties', propertiesRoutes);

export default router;
