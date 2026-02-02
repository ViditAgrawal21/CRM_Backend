import { z } from 'zod';

export const createLogSchema = z.object({
  leadId: z.string().uuid(),
  action: z.enum(['call', 'whatsapp', 'template', 'meeting', 'visit', 'note', 'status_change']),
  duration: z.number().int().min(0).optional(),
  templateId: z.string().uuid().optional(),
  outcome: z.string().optional(),
  notes: z.string().optional()
});
