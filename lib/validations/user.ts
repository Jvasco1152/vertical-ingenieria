import { z } from 'zod';

/**
 * Schema para crear un nuevo usuario
 */
export const createUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['ADMIN', 'WORKER', 'CLIENT']),
  phone: z.string().max(20).optional().nullable(),
  image: z.string().url().optional().nullable(),
});

/**
 * Schema para actualizar un usuario existente
 */
export const updateUserSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100).optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  role: z.enum(['ADMIN', 'WORKER', 'CLIENT']).optional(),
  phone: z.string().max(20).optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
