import { z } from 'zod';

export const createQuoteRequestSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'El email es requerido'),

  tipoCliente: z.enum([
    'Otis',
    'Cliente Directo',
    'Conecta',
    'Ascensores Schindler',
    'Soluciones Verticales',
    'Mitsubishi',
  ], { message: 'Debe seleccionar el tipo de cliente' }),

  obraEdificio: z
    .string()
    .min(2, 'El nombre de la obra/edificio debe tener al menos 2 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),

  direccion: z
    .string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(300, 'La dirección no puede exceder 300 caracteres'),

  ciudad: z.enum([
    'Medellín',
    'Sabaneta',
    'Itagui',
    'Envigado',
    'Bello',
    'Rionegro',
    'Copacabana',
    'Girardota',
    'Otro',
  ], { message: 'Debe seleccionar la ciudad' }),

  ciudadOtro: z
    .string()
    .max(100, 'La ciudad no puede exceder 100 caracteres')
    .optional(),

  quienSolicita: z
    .string()
    .max(200, 'El campo no puede exceder 200 caracteres')
    .optional(),

  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),

  tipoCotizacion: z.enum([
    'Modernización completa o parcial de cabina',
    'Pintura de puertas de piso',
    'Requerimiento especial',
  ], { message: 'Debe seleccionar el tipo de cotización' }),

  nombreContacto: z
    .string()
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),

  telefonoContacto: z
    .string()
    .max(50, 'El teléfono no puede exceder 50 caracteres')
    .optional(),

  requerimientoEspecial: z
    .string()
    .max(2000, 'El requerimiento no puede exceder 2000 caracteres')
    .optional(),
}).refine(
  (data) => data.ciudad !== 'Otro' || (data.ciudadOtro && data.ciudadOtro.trim().length > 0),
  {
    message: 'Debe especificar la ciudad',
    path: ['ciudadOtro'],
  }
);

export const updateQuoteRequestSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'CONVERTED', 'REJECTED']).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
export type UpdateQuoteRequestInput = z.infer<typeof updateQuoteRequestSchema>;
