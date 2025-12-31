import { z } from 'zod';
import { ProjectPhase } from '@prisma/client';

/**
 * Schema de validación para crear una nueva imagen
 */
export const createImageSchema = z.object({
  url: z.string().url('URL inválida'),
  publicId: z.string().min(1, 'Public ID requerido'),
  phase: z.nativeEnum(ProjectPhase),
  description: z.string().max(500, 'Descripción muy larga (máximo 500 caracteres)').optional(),
});

export type CreateImageInput = z.infer<typeof createImageSchema>;
