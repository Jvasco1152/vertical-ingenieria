import { z } from 'zod';

// Valida solo los campos requeridos de la Sección 1.
// Los campos de secciones 2-6 son todos opcionales en el servidor;
// la validación específica de cada sección se maneja en el cliente.
export const createQuoteRequestSchema = z.object({
  email: z.string().email('Email inválido'),
  tipoCliente: z.string().min(1, 'Requerido'),
  tipoClienteOtro: z.string().optional(),
  obraEdificio: z.string().min(1, 'Requerido').max(200),
  direccion: z.string().min(1, 'Requerido').max(300),
  ciudad: z.string().min(1, 'Requerida'),
  ciudadOtro: z.string().max(100).optional(),
  quienSolicita: z.string().min(1, 'Requerido').max(200),
  nombreContacto: z.string().max(200).optional(),
  telefonoContacto: z.string().max(50).optional(),
  emailContacto: z.string().optional(),
  tipoCotizacion: z.string().min(1, 'Requerido'),
  tipoCotizacionOtro: z.string().max(300).optional(),
  requerimientoEspecial: z.string().optional(),
  requerimientoEspecialOtro: z.string().max(300).optional(),

  // Campos compartidos (medidas)
  anchoCabina: z.string().max(20).optional(),
  fondoCabina: z.string().max(20).optional(),

  // Sección 2
  altoCabina: z.string().max(20).optional(),
  tipoPuertaCabina: z.string().optional(),
  tipoPuertaCabinaOtro: z.string().optional(),
  anchoPuertaCabina: z.string().max(20).optional(),
  altoPuertaCabina: z.string().max(20).optional(),
  itemsCotizar: z.record(z.string(), z.string()).optional(),
  descripcionRestauracion: z.string().max(5000).optional(),
  fotosRestauracion: z.array(z.string()).optional(),
  tipoCieloFalso: z.string().optional(),
  tipoCieloFalsoOtro: z.string().optional(),
  tipoEspejo: z.record(z.string(), z.object({ pasamanosTecho: z.boolean(), pisoTecho: z.boolean() })).optional(),
  acabadoPaneles: z.record(z.string(), z.object({ antes: z.boolean(), aCotizar: z.boolean() })).optional(),
  tipoPiso: z.record(z.string(), z.object({ actual: z.boolean(), aCotizar: z.boolean() })).optional(),
  pisoBaseAdicional: z.string().optional(),
  problemasPiso: z.array(z.string()).optional(),

  // Sección 3
  descripcionCieloFalso: z.string().max(5000).optional(),
  fotosCieloFalso: z.array(z.string()).optional(),

  // Sección 4
  descripcionPisoOpcional: z.string().max(5000).optional(),
  descripcionPiso: z.string().max(5000).optional(),
  fotosPiso: z.array(z.string()).optional(),

  // Sección 5
  numPisos: z.string().max(20).optional(),
  tipoPuertasPiso: z.array(z.string()).optional(),
  tipoPuertasPisoOtro: z.string().optional(),
  tipoMarco: z.string().optional(),
  tipoMarcoOtro: z.string().optional(),
  acabadoPuertasLobby: z.string().optional(),
  acabadoPuertasLobbyOtro: z.string().optional(),
  acabadoPuertasOtrosPisos: z.string().optional(),
  acabadoPuertasOtrosOtro: z.string().optional(),
  descripcionPuertas: z.string().max(5000).optional(),
  fotosPuertas: z.array(z.string()).optional(),

  // Sección 6
  descripcionOtro: z.string().max(5000).optional(),
  descripcionOtroReq: z.string().max(5000).optional(),
  fotosOtro: z.array(z.string()).optional(),
});

export const updateQuoteRequestSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'CONVERTED', 'REJECTED']).optional(),
  adminNotes: z.string().max(5000).optional(),
});

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>;
export type UpdateQuoteRequestInput = z.infer<typeof updateQuoteRequestSchema>;
