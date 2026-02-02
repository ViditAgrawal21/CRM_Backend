import { z } from 'zod';

export const createNoteSchema = z.object({
  leadId: z.string().uuid(),
  text: z.string().min(1, 'Note text is required')
});
