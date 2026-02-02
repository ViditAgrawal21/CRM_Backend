import { z } from 'zod';

export const createVisitSchema = z.object({
  leadId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  siteLocation: z.string().min(1, 'Site location is required'),
  notes: z.string().optional()
});

export const updateVisitSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'missed']),
  outcome: z.string().optional(),
  notes: z.string().optional()
});
