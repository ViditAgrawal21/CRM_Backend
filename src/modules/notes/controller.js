import * as notesService from './service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const createNoteController = asyncHandler(async (req, res) => {
  const note = await notesService.createNote(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: note
  });
});

export const getNotesController = asyncHandler(async (req, res) => {
  const { leadId } = req.query;

  if (!leadId) {
    return res.status(400).json({ error: 'Lead ID is required' });
  }

  const notes = await notesService.getNotes(leadId);

  res.status(200).json({
    success: true,
    data: notes
  });
});
