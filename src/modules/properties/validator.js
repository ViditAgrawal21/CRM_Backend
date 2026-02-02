import { z } from 'zod';

export const createPropertySchema = z.object({
  projectName: z.string().min(1),
  builders: z.string().min(1),
  location: z.string().min(1),
  configuration: z.string().min(1),
  price: z.string().min(1),
  possession: z.string().min(1),
  link: z.string().url().optional(),
  contactUs: z.string().min(1)
});
