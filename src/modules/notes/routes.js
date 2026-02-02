import express from 'express';
import * as notesController from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createNoteSchema } from './validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createNoteSchema), notesController.createNoteController);
router.get('/', notesController.getNotesController);

export default router;
