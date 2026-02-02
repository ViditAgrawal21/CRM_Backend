import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10).max(15),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'manager', 'employee']),
  monthlyMeetingTarget: z.number().int().min(0).optional(),
  monthlyVisitTarget: z.number().int().min(0).optional(),
  monthlyRevenueTarget: z.number().min(0).optional(),
  monthlyBonus: z.number().min(0).optional()
});

export const deactivateUserSchema = z.object({
  userId: z.string().uuid()
});
