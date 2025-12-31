import { z } from 'zod';

/**
 * Esquema de validación para crear un comentario
 */
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede exceder 2000 caracteres')
    .trim(),

  projectId: z
    .string()
    .min(1, 'El ID del proyecto es requerido'),
});

/**
 * Esquema de validación para actualizar un comentario
 */
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'El comentario no puede estar vacío')
    .max(2000, 'El comentario no puede exceder 2000 caracteres')
    .trim(),
});

// Tipos TypeScript inferidos de los schemas
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
