import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProjectSchema } from '@/lib/validations/project';
import { notifyPhaseChange, notifyProjectCompleted, notifyWorkerAssigned } from '@/lib/notifications';
import { z } from 'zod';

/**
 * GET /api/projects/[id]
 * Obtiene un proyecto específico
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

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        workers: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        phases: {
          orderBy: {
            startedAt: 'desc',
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Verificar permisos
    const isAdmin = session.user.role === 'ADMIN';
    const isClient = session.user.role === 'CLIENT' && project.clientId === session.user.id;
    const isWorker = session.user.role === 'WORKER' &&
      project.workers.some((w) => w.workerId === session.user.id);

    if (!isAdmin && !isClient && !isWorker) {
      return NextResponse.json(
        { error: 'Sin permisos para ver este proyecto' },
        { status: 403 }
      );
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Actualiza un proyecto existente
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo ADMIN puede actualizar proyectos
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden actualizar proyectos' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Validar datos
    const validatedData = updateProjectSchema.parse(body);

    // Verificar que el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        workers: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Convertir fechas si están presentes
    const startDate = validatedData.startDate
      ? validatedData.startDate === '' ? null : new Date(validatedData.startDate)
      : undefined;

    const estimatedEndDate = validatedData.estimatedEndDate
      ? validatedData.estimatedEndDate === '' ? null : new Date(validatedData.estimatedEndDate)
      : undefined;

    // Preparar datos de actualización
    const updateData: any = {
      ...(validatedData.title && { title: validatedData.title }),
      ...(validatedData.description && { description: validatedData.description }),
      ...(validatedData.location && { location: validatedData.location }),
      ...(validatedData.clientId && { clientId: validatedData.clientId }),
      ...(validatedData.status && { status: validatedData.status }),
      ...(validatedData.currentPhase && { currentPhase: validatedData.currentPhase }),
      ...(validatedData.progress !== undefined && { progress: validatedData.progress }),
      ...(startDate !== undefined && { startDate }),
      ...(estimatedEndDate !== undefined && { estimatedEndDate }),
      ...(validatedData.budget !== undefined && { budget: validatedData.budget }),
    };

    // Si se cambió la fase, crear registro de cambio y notificar
    if (validatedData.currentPhase && validatedData.currentPhase !== existingProject.currentPhase) {
      updateData.phases = {
        create: {
          phase: validatedData.currentPhase,
          startedAt: new Date(),
          notes: `Cambio de fase: ${existingProject.currentPhase} → ${validatedData.currentPhase}`,
        },
      };

      // Notificar cambio de fase asíncronamente
      notifyPhaseChange(id, existingProject.currentPhase, validatedData.currentPhase).catch((err) =>
        console.error('Error generando notificaciones:', err)
      );
    }

    // Si el proyecto se marcó como completado, notificar
    if (validatedData.status === 'COMPLETED' && existingProject.status !== 'COMPLETED') {
      notifyProjectCompleted(id).catch((err) =>
        console.error('Error generando notificaciones:', err)
      );
    }

    // Actualizar trabajadores si se proporcionaron
    if (validatedData.workerIds !== undefined) {
      // Obtener trabajadores actuales para saber quiénes son nuevos
      const currentWorkerIds = existingProject.workers.map((w) => w.workerId);
      const newWorkerIds = validatedData.workerIds.filter(
        (id) => !currentWorkerIds.includes(id)
      );

      // Eliminar asignaciones actuales
      await prisma.projectWorker.deleteMany({
        where: { projectId: id },
      });

      // Crear nuevas asignaciones
      if (validatedData.workerIds.length > 0) {
        updateData.workers = {
          create: validatedData.workerIds.map((workerId) => ({
            workerId,
          })),
        };
      }

      // Notificar a trabajadores recién asignados
      newWorkerIds.forEach((workerId) => {
        notifyWorkerAssigned(id, workerId).catch((err) =>
          console.error('Error generando notificaciones:', err)
        );
      });
    }

    // Actualizar proyecto
    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workers: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(project, { status: 200 });
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

    console.error('Error actualizando proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Elimina un proyecto
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo ADMIN puede eliminar proyectos
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden eliminar proyectos' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // Eliminar proyecto (cascade eliminará relaciones)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Proyecto eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error eliminando proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
