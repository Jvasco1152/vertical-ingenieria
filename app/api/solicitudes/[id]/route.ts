import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateQuoteRequestSchema } from '@/lib/validations/quoteRequest';
import { z } from 'zod';

/**
 * GET /api/solicitudes/[id]
 * Solo ADMIN. Retorna una solicitud por ID.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const solicitud = await prisma.quoteRequest.findUnique({
      where: { id: params.id },
    });

    if (!solicitud) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ solicitud }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/solicitudes/[id]
 * Solo ADMIN. Actualiza status y/o adminNotes.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateQuoteRequestSchema.parse(body);

    const solicitud = await prisma.quoteRequest.update({
      where: { id: params.id },
      data: {
        ...(validatedData.status && { status: validatedData.status }),
        ...(validatedData.adminNotes !== undefined && { adminNotes: validatedData.adminNotes }),
      },
    });

    return NextResponse.json({ solicitud }, { status: 200 });
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

    console.error('Error actualizando solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
