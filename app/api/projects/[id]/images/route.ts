import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createImageSchema } from '@/lib/validations/image';
import { notifyNewImage } from '@/lib/notifications';
import { z } from 'zod';
import { ProjectPhase } from '@prisma/client';

/**
 * GET /api/projects/[id]/images?phase=INSTALLATION
 * Obtiene todas las imágenes de un proyecto, con filtro opcional por fase
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Await params (Next.js 15+)
    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const phase = searchParams.get('phase');

    // Verificar que el proyecto existe y obtener datos para validar acceso
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        workers: {
          where: { workerId: session.user.id },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Verificar permisos de acceso
    // ADMIN: acceso a todo
    // CLIENT: solo si es el dueño del proyecto
    // WORKER: solo si está asignado al proyecto
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = project.clientId === session.user.id;
    const isAssignedWorker = session.user.role === 'WORKER' && project.workers.length > 0;

    if (!isAdmin && !isOwner && !isAssignedWorker) {
      return NextResponse.json(
        { error: 'Sin permisos para acceder a este proyecto' },
        { status: 403 }
      );
    }

    // Obtener imágenes con filtro opcional por fase
    const whereClause: any = { projectId: id };

    if (phase && Object.values(ProjectPhase).includes(phase as ProjectPhase)) {
      whereClause.phase = phase as ProjectPhase;
    }

    const images = await prisma.projectImage.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/images
 * Crea un nuevo registro de imagen después de que fue subida a Cloudinary
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo ADMIN y WORKER pueden subir imágenes
    if (!['ADMIN', 'WORKER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores y trabajadores pueden subir imágenes' },
        { status: 403 }
      );
    }

    // Await params (Next.js 15+)
    const { id } = await params;

    const body = await req.json();

    // Validar datos con Zod
    const validatedData = createImageSchema.parse(body);

    // Verificar que el proyecto existe y obtener datos para validar permisos
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        workers: {
          where: { workerId: session.user.id },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Si es WORKER, verificar que está asignado al proyecto
    if (session.user.role === 'WORKER' && project.workers.length === 0) {
      return NextResponse.json(
        { error: 'No estás asignado a este proyecto' },
        { status: 403 }
      );
    }

    // Crear registro de imagen en la base de datos
    const image = await prisma.projectImage.create({
      data: {
        projectId: id,
        url: validatedData.url,
        publicId: validatedData.publicId,
        phase: validatedData.phase,
        description: validatedData.description,
        uploadedBy: session.user.id,
      },
    });

    // Generar notificación asíncronamente (no esperar)
    notifyNewImage(id, session.user.name || 'Un usuario').catch((err) =>
      console.error('Error generando notificaciones:', err)
    );

    return NextResponse.json(image, { status: 201 });
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

    console.error('Error creando imagen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
