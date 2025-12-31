import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/gallery
 * Obtiene todas las imágenes de proyectos con filtros
 * Query params:
 * - projectId: Filtrar por proyecto específico
 * - search: Buscar por título del proyecto o descripción de imagen
 * - sortBy: Ordenar por campo (createdAt, updatedAt)
 * - sortOrder: Orden (asc, desc)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Construir filtros para proyectos según el rol
    const projectWhere: any = {};

    if (session.user.role === 'CLIENT') {
      projectWhere.clientId = session.user.id;
    } else if (session.user.role === 'WORKER') {
      projectWhere.workers = {
        some: {
          workerId: session.user.id,
        },
      };
    }

    // Filtro por proyecto específico
    if (projectId && projectId !== 'ALL') {
      projectWhere.id = projectId;
    }

    // Filtro de búsqueda por título de proyecto
    if (search && search.trim() !== '') {
      projectWhere.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Construir ordenamiento
    const orderBy: any = {};
    const validSortFields = ['createdAt', 'updatedAt'];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    // Obtener imágenes con información del proyecto
    const images = await prisma.projectImage.findMany({
      where: {
        project: projectWhere,
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            location: true,
            status: true,
            currentPhase: true,
            client: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy,
    });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo imágenes de galería:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
