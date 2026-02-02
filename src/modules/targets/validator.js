import { z } from 'zod';

export const setTargetSchema = z.object({
  userId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-01$/, 'Month must be first day of month (YYYY-MM-01)'),
  meetingTarget: z.number().int().min(0),
  visitTarget: z.number().int().min(0),
  revenueTarget: z.number().min(0),
  bonus: z.number().min(0)
});

export const approveBonusSchema = z.object({
  targetId: z.string().uuid()
});
