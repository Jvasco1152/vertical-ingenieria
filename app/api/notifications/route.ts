import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { markAsReadSchema } from '@/lib/validations/notification';
import { z } from 'zod';

/**
 * GET /api/notifications
 * Obtiene las notificaciones del usuario actual
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Construir filtro
    const where: any = {
      userId: session.user.id,
    };

    if (unreadOnly) {
      where.read = false;
    }

    // Obtener notificaciones
    const notifications = await prisma.notification.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limitar a últimas 50 notificaciones
    });

    // Contar no leídas
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    });

    return NextResponse.json(
      {
        notifications,
        unreadCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error obteniendo notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications
 * Marca notificaciones como leídas
 */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validatedData = markAsReadSchema.parse(body);

    // Actualizar notificaciones
    const result = await prisma.notification.updateMany({
      where: {
        id: {
          in: validatedData.notificationIds,
        },
        userId: session.user.id, // Seguridad: solo las propias notificaciones
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(
      {
        message: `${result.count} notificación(es) marcada(s) como leída(s)`,
        count: result.count,
      },
      { status: 200 }
    );
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

    console.error('Error marcando notificaciones como leídas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications
 * Marca todas las notificaciones como leídas
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Marcar todas como leídas
    const result = await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Todas las notificaciones marcadas como leídas',
        count: result.count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error marcando todas las notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
