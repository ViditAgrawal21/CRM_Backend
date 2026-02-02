import { z } from 'zod';

export const createFollowupSchema = z.object({
  leadId: z.string().uuid(),
  reminderAt: z.string().datetime(),
  notes: z.string().optional()
});

export const updateFollowupSchema = z.object({
  status: z.enum(['pending', 'missed', 'done']),
  outcome: z.string().optional(),
  notes: z.string().optional()
});
