import { z } from 'zod';

/**
 * Esquema de validación para crear un proyecto
 */
export const createProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  location: z
    .string()
    .min(3, 'La ubicación debe tener al menos 3 caracteres')
    .max(500, 'La ubicación no puede exceder 500 caracteres'),

  clientId: z
    .string()
    .min(1, 'Debe seleccionar un cliente'),

  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED'])
    .default('PENDING'),

  currentPhase: z
    .enum(['MEASUREMENT', 'DESIGN', 'APPROVAL', 'INSTALLATION', 'FINISHING', 'DELIVERY'])
    .default('MEASUREMENT'),

  progress: z
    .number()
    .min(0, 'El progreso mínimo es 0%')
    .max(100, 'El progreso máximo es 100%')
    .default(0),

  startDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal('')),

  estimatedEndDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal('')),

  budget: z
    .number()
    .positive('El presupuesto debe ser mayor a 0')
    .optional()
    .or(z.literal(null)),

  workerIds: z
    .array(z.string())
    .optional()
    .default([]),
});

/**
 * Esquema de validación para actualizar un proyecto
 * Todos los campos son opcionales excepto el ID
 */
export const updateProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres')
    .optional(),

  description: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),

  location: z
    .string()
    .min(3, 'La ubicación debe tener al menos 3 caracteres')
    .max(500, 'La ubicación no puede exceder 500 caracteres')
    .optional(),

  clientId: z
    .string()
    .min(1, 'Debe seleccionar un cliente')
    .optional(),

  status: z
    .enum(['PENDING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED'])
    .optional(),

  currentPhase: z
    .enum(['MEASUREMENT', 'DESIGN', 'APPROVAL', 'INSTALLATION', 'FINISHING', 'DELIVERY'])
    .optional(),

  progress: z
    .number()
    .min(0, 'El progreso mínimo es 0%')
    .max(100, 'El progreso máximo es 100%')
    .optional(),

  startDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal(''))
    .or(z.literal(null)),

  estimatedEndDate: z
    .string()
    .datetime()
    .optional()
    .or(z.literal(''))
    .or(z.literal(null)),

  budget: z
    .number()
    .positive('El presupuesto debe ser mayor a 0')
    .optional()
    .or(z.literal(null)),

  workerIds: z
    .array(z.string())
    .optional(),
});

// Tipos TypeScript inferidos de los schemas
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
