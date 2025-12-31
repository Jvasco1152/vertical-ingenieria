import { z } from 'zod';

/**
 * Esquema para marcar notificaciones como leídas
 */
export const markAsReadSchema = z.object({
  notificationIds: z.array(z.string()).min(1, 'Debe proporcionar al menos una notificación'),
});

// Tipos TypeScript
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
