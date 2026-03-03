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
    const validatedData = createQuoteRequestSchema.parse(body);

    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        email: validatedData.email,
        tipoCliente: validatedData.tipoCliente,
        obraEdificio: validatedData.obraEdificio,
        direccion: validatedData.direccion,
        ciudad: validatedData.ciudad,
        ciudadOtro: validatedData.ciudadOtro || null,
        quienSolicita: validatedData.quienSolicita || null,
        descripcion: validatedData.descripcion,
        tipoCotizacion: validatedData.tipoCotizacion,
        nombreContacto: validatedData.nombreContacto || null,
        telefonoContacto: validatedData.telefonoContacto || null,
        requerimientoEspecial: validatedData.requerimientoEspecial || null,
        anchoCabina: validatedData.anchoCabina || null,
        fondoCabina: validatedData.fondoCabina || null,
        tipoCieloFalso: validatedData.tipoCieloFalso || null,
        tipoCieloFalsoOtro: validatedData.tipoCieloFalsoOtro || null,
        fotosCieloFalso: validatedData.fotosCieloFalso || [],
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

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
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
