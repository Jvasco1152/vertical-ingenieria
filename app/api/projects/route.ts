import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createProjectSchema } from '@/lib/validations/project';
import { z } from 'zod';

/**
 * GET /api/projects
 * Obtiene todos los proyectos con filtros opcionales
 * Query params:
 * - search: Búsqueda por título, descripción o ubicación
 * - status: Filtrar por estado (PENDING, IN_PROGRESS, PAUSED, COMPLETED, CANCELLED)
 * - currentPhase: Filtrar por fase (MEASUREMENT, DESIGN, APPROVAL, INSTALLATION, FINISHING, DELIVERY)
 * - clientId: Filtrar por cliente (solo ADMIN)
 * - sortBy: Ordenar por campo (createdAt, title, progress, updatedAt)
 * - sortOrder: Orden (asc, desc)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const currentPhase = searchParams.get('currentPhase');
    const clientId = searchParams.get('clientId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros dinámicos
    const where: any = {};

    // Filtrar por rol
    if (session.user.role === 'CLIENT') {
      // Los clientes solo ven sus propios proyectos
      where.clientId = session.user.id;
    } else if (session.user.role === 'WORKER') {
      // Los trabajadores solo ven proyectos asignados a ellos
      where.workers = {
        some: {
          workerId: session.user.id,
        },
      };
    }
    // Los ADMIN ven todos los proyectos (sin filtro adicional)

    // Aplicar búsqueda por texto
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Aplicar filtros opcionales
    if (status && status !== 'ALL') where.status = status;
    if (currentPhase && currentPhase !== 'ALL') where.currentPhase = currentPhase;
    if (clientId && clientId !== 'ALL' && session.user.role === 'ADMIN') where.clientId = clientId;

    // Construir ordenamiento
    const orderBy: any = {};
    const validSortFields = ['createdAt', 'updatedAt', 'title', 'progress'];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const projects = await prisma.project.findMany({
      where,
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
        _count: {
          select: {
            images: true,
            comments: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo proyectos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Crea un nuevo proyecto
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo ADMIN puede crear proyectos
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden crear proyectos' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validar datos con Zod
    const validatedData = createProjectSchema.parse(body);

    // Convertir fechas de string a Date
    const startDate = validatedData.startDate ? new Date(validatedData.startDate) : null;
    const estimatedEndDate = validatedData.estimatedEndDate ? new Date(validatedData.estimatedEndDate) : null;

    // Crear proyecto
    const project = await prisma.project.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        location: validatedData.location,
        clientId: validatedData.clientId,
        status: validatedData.status,
        currentPhase: validatedData.currentPhase,
        progress: validatedData.progress,
        startDate,
        estimatedEndDate,
        budget: validatedData.budget || null,
        // Asignar trabajadores si se proporcionaron
        workers: validatedData.workerIds && validatedData.workerIds.length > 0 ? {
          create: validatedData.workerIds.map((workerId) => ({
            workerId,
          })),
        } : undefined,
        // Crear registro de fase inicial
        phases: {
          create: {
            phase: validatedData.currentPhase,
            startedAt: new Date(),
            notes: 'Fase inicial del proyecto',
          },
        },
      },
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

    return NextResponse.json(project, { status: 201 });
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

    console.error('Error creando proyecto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
