import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createQuoteRequestSchema } from '@/lib/validations/quoteRequest';
import { z } from 'zod';

/**
 * POST /api/solicitudes
 * Público — sin autenticación. Crea una solicitud de cotización.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = createQuoteRequestSchema.parse(body);

    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        // Sección 1
        email: validated.email,
        tipoCliente: validated.tipoCliente,
        tipoClienteOtro: validated.tipoClienteOtro ?? null,
        obraEdificio: validated.obraEdificio,
        direccion: validated.direccion,
        ciudad: validated.ciudad,
        ciudadOtro: validated.ciudadOtro ?? null,
        quienSolicita: validated.quienSolicita ?? null,
        nombreContacto: validated.nombreContacto ?? null,
        telefonoContacto: validated.telefonoContacto ?? null,
        emailContacto: validated.emailContacto ?? null,
        tipoCotizacion: validated.tipoCotizacion,
        tipoCotizacionOtro: validated.tipoCotizacionOtro ?? null,
        requerimientoEspecial: validated.requerimientoEspecial ?? null,
        requerimientoEspecialOtro: validated.requerimientoEspecialOtro ?? null,

        // Compartidos
        anchoCabina: validated.anchoCabina ?? null,
        fondoCabina: validated.fondoCabina ?? null,

        // Sección 2
        altoCabina: validated.altoCabina ?? null,
        tipoPuertaCabina: validated.tipoPuertaCabina ?? null,
        tipoPuertaCabinaOtro: validated.tipoPuertaCabinaOtro ?? null,
        anchoPuertaCabina: validated.anchoPuertaCabina ?? null,
        altoPuertaCabina: validated.altoPuertaCabina ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        itemsCotizar: (validated.itemsCotizar ?? undefined) as any,
        descripcionRestauracion: validated.descripcionRestauracion ?? null,
        fotosRestauracion: validated.fotosRestauracion ?? [],
        tipoCieloFalso: validated.tipoCieloFalso ?? null,
        tipoCieloFalsoOtro: validated.tipoCieloFalsoOtro ?? null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tipoEspejo: (validated.tipoEspejo ?? undefined) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        acabadoPaneles: (validated.acabadoPaneles ?? undefined) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tipoPiso: (validated.tipoPiso ?? undefined) as any,
        pisoBaseAdicional: validated.pisoBaseAdicional ?? null,
        problemasPiso: validated.problemasPiso ?? [],

        // Sección 3
        descripcionCieloFalso: validated.descripcionCieloFalso ?? null,
        fotosCieloFalso: validated.fotosCieloFalso ?? [],

        // Sección 4
        descripcionPisoOpcional: validated.descripcionPisoOpcional ?? null,
        descripcionPiso: validated.descripcionPiso ?? null,
        fotosPiso: validated.fotosPiso ?? [],

        // Sección 5
        numPisos: validated.numPisos ?? null,
        tipoPuertasPiso: validated.tipoPuertasPiso ?? [],
        tipoPuertasPisoOtro: validated.tipoPuertasPisoOtro ?? null,
        tipoMarco: validated.tipoMarco ?? null,
        tipoMarcoOtro: validated.tipoMarcoOtro ?? null,
        acabadoPuertasLobby: validated.acabadoPuertasLobby ?? null,
        acabadoPuertasLobbyOtro: validated.acabadoPuertasLobbyOtro ?? null,
        acabadoPuertasOtrosPisos: validated.acabadoPuertasOtrosPisos ?? null,
        acabadoPuertasOtrosOtro: validated.acabadoPuertasOtrosOtro ?? null,
        descripcionPuertas: validated.descripcionPuertas ?? null,
        fotosPuertas: validated.fotosPuertas ?? [],

        // Sección 6
        descripcionOtro: validated.descripcionOtro ?? null,
        descripcionOtroReq: validated.descripcionOtroReq ?? null,
        fotosOtro: validated.fotosOtro ?? [],
      },
    });

    return NextResponse.json({ id: quoteRequest.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: error.issues.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error creando solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/solicitudes
 * Solo ADMIN. Retorna lista de solicitudes con filtro opcional por status.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const solicitudes = await prisma.quoteRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        tipoCliente: true,
        tipoClienteOtro: true,
        obraEdificio: true,
        ciudad: true,
        ciudadOtro: true,
        tipoCotizacion: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ solicitudes }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
