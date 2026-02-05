import { z } from 'zod';

export const loginSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

export const initializeOwnerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must not exceed 15 digits'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});
