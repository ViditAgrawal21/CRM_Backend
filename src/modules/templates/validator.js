import { z } from 'zod';

export const createTemplateSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  message: z.string().min(1, 'Message is required')
});

export const updateTemplateSchema = z.object({
  title: z.string().min(2).optional(),
  message: z.string().min(1).optional(),
  isActive: z.boolean().optional()
});
