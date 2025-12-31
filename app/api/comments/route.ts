import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createCommentSchema } from '@/lib/validations/comment';
import { notifyNewComment } from '@/lib/notifications';
import { z } from 'zod';

/**
 * GET /api/comments?projectId=xxx
 * Obtiene todos los comentarios de un proyecto
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId es requerido' }, { status: 400 });
    }

    // Verificar que el proyecto existe y el usuario tiene acceso
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workers: {
          where: { workerId: session.user.id },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Verificar permisos
    const isAdmin = session.user.role === 'ADMIN';
    const isClient = session.user.role === 'CLIENT' && project.clientId === session.user.id;
    const isWorker = session.user.role === 'WORKER' && project.workers.length > 0;

    if (!isAdmin && !isClient && !isWorker) {
      return NextResponse.json(
        { error: 'Sin permisos para ver comentarios de este proyecto' },
        { status: 403 }
      );
    }

    // Obtener comentarios
    const comments = await prisma.comment.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/comments
 * Crea un nuevo comentario
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar datos
    const validatedData = createCommentSchema.parse(body);

    // Verificar que el proyecto existe y el usuario tiene acceso
    const project = await prisma.project.findUnique({
      where: { id: validatedData.projectId },
      include: {
        workers: {
          where: { workerId: session.user.id },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Verificar permisos para comentar
    const isAdmin = session.user.role === 'ADMIN';
    const isClient = session.user.role === 'CLIENT' && project.clientId === session.user.id;
    const isWorker = session.user.role === 'WORKER' && project.workers.length > 0;

    if (!isAdmin && !isClient && !isWorker) {
      return NextResponse.json(
        { error: 'Sin permisos para comentar en este proyecto' },
        { status: 403 }
      );
    }

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        projectId: validatedData.projectId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
      },
    });

    // Generar notificaciones asíncronamente (no esperar)
    notifyNewComment(validatedData.projectId, session.user.name || 'Un usuario', session.user.id).catch(
      (err) => console.error('Error generando notificaciones:', err)
    );

    return NextResponse.json(comment, { status: 201 });
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

    console.error('Error creando comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
