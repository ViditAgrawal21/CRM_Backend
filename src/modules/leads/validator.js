import { z } from 'zod';

export const createLeadSchema = z.object({
  type: z.enum(['lead', 'data']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10).max(15),
  configuration: z.string().optional(),
  location: z.string().optional(),
  remark: z.string().optional(),
  assignedTo: z.string().uuid().optional()
});

export const updateLeadSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).max(15).optional(),
  configuration: z.string().optional(),
  location: z.string().optional(),
  remark: z.string().optional(),
  status: z.enum(['new', 'contacted', 'interested', 'not_interested', 'prospect', 'converted', 'spam']).optional()
});

export const assignLeadSchema = z.object({
  leadId: z.string().uuid(),
  assignedTo: z.string().uuid()
});
