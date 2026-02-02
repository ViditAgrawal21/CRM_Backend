import { z } from 'zod';

export const createMeetingSchema = z.object({
  leadId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  location: z.string().optional(),
  notes: z.string().optional()
});

export const updateMeetingSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'missed']),
  outcome: z.string().optional(),
  notes: z.string().optional()
});
