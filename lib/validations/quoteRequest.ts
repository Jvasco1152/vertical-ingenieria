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
    'Restauración completa y/o parcial de cabina',
    'Solo mejora en iluminación o cambio de cielo falso',
    'Solo cambio de piso o restauración de plataforma',
    'Pintura de puertas de piso',
    'Otro',
  ], { message: 'Debe seleccionar el tipo de cotización' }),

  tipoCotizacionOtro: z
    .string()
    .max(300, 'El campo no puede exceder 300 caracteres')
    .optional(),

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

  // Campos específicos para Cambio de Cielo Falso
  anchoCabina: z
    .string()
    .max(20, 'El ancho no puede exceder 20 caracteres')
    .optional(),

  fondoCabina: z
    .string()
    .max(20, 'El fondo no puede exceder 20 caracteres')
    .optional(),

  tipoCieloFalso: z
    .string()
    .max(100, 'El tipo no puede exceder 100 caracteres')
    .optional(),

  tipoCieloFalsoOtro: z
    .string()
    .max(300, 'La descripción no puede exceder 300 caracteres')
    .optional(),

  fotosCieloFalso: z
    .array(z.string().url('URL inválida'))
    .max(5, 'Máximo 5 fotos permitidas')
    .optional(),
}).refine(
  (data) => data.ciudad !== 'Otro' || (data.ciudadOtro && data.ciudadOtro.trim().length > 0),
  {
    message: 'Debe especificar la ciudad',
    path: ['ciudadOtro'],
  }
).refine(
  (data) => data.tipoCotizacion !== 'Otro' || (data.tipoCotizacionOtro && data.tipoCotizacionOtro.trim().length > 0),
  {
    message: 'Debe especificar el tipo de cotización',
    path: ['tipoCotizacionOtro'],
  }
);

export const updateQuoteRequestSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'CONVERTED', 'REJECTED']).optional(),
  adminNotes: z.string().max(2000).optional(),
});

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
export type UpdateQuoteRequestInput = z.infer<typeof updateQuoteRequestSchema>;
