import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas del dashboard
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayCurrentMonthLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Construir filtros según el rol del usuario
    const projectFilter: any = {};

    if (session.user.role === 'CLIENT') {
      projectFilter.clientId = session.user.id;
    } else if (session.user.role === 'WORKER') {
      projectFilter.workers = {
        some: {
          workerId: session.user.id,
        },
      };
    }
    // ADMIN ve todos los proyectos

    // 1. Proyectos activos (PENDING + IN_PROGRESS + PAUSED)
    const activeProjects = await prisma.project.count({
      where: {
        ...projectFilter,
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'PAUSED'],
        },
      },
    });

    // Proyectos activos el mes pasado
    const activeProjectsLastMonth = await prisma.project.count({
      where: {
        ...projectFilter,
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'PAUSED'],
        },
        createdAt: {
          lt: firstDayCurrentMonth,
        },
      },
    });

    // Proyectos activos creados este mes
    const activeProjectsThisMonth = await prisma.project.count({
      where: {
        ...projectFilter,
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'PAUSED'],
        },
        createdAt: {
          gte: firstDayCurrentMonth,
        },
      },
    });

    // 2. Proyectos en progreso
    const inProgressProjects = await prisma.project.count({
      where: {
        ...projectFilter,
        status: 'IN_PROGRESS',
      },
    });

    // 3. Proyectos completados (total histórico)
    const completedProjects = await prisma.project.count({
      where: {
        ...projectFilter,
        status: 'COMPLETED',
      },
    });

    // Proyectos completados este mes
    const completedThisMonth = await prisma.project.count({
      where: {
        ...projectFilter,
        status: 'COMPLETED',
        updatedAt: {
          gte: firstDayCurrentMonth,
        },
      },
    });

    // 4. Avance promedio de proyectos activos
    const projectsWithProgress = await prisma.project.findMany({
      where: {
        ...projectFilter,
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'PAUSED'],
        },
      },
      select: {
        progress: true,
      },
    });

    const averageProgress =
      projectsWithProgress.length > 0
        ? Math.round(
            projectsWithProgress.reduce((acc, p) => acc + p.progress, 0) /
              projectsWithProgress.length
          )
        : 0;

    // Avance promedio del mes pasado
    const projectsWithProgressLastMonth = await prisma.project.findMany({
      where: {
        ...projectFilter,
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'PAUSED'],
        },
        updatedAt: {
          lt: firstDayCurrentMonth,
        },
      },
      select: {
        progress: true,
      },
    });

    const averageProgressLastMonth =
      projectsWithProgressLastMonth.length > 0
        ? Math.round(
            projectsWithProgressLastMonth.reduce((acc, p) => acc + p.progress, 0) /
              projectsWithProgressLastMonth.length
          )
        : 0;

    const progressDiff = averageProgress - averageProgressLastMonth;

    // 5. Actividad reciente (últimas 10 actualizaciones)
    const recentActivity = await prisma.project.findMany({
      where: projectFilter,
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        currentPhase: true,
        progress: true,
        updatedAt: true,
        client: {
          select: {
            name: true,
          },
        },
      },
    });

    // Calcular porcentaje de proyectos en progreso respecto al total activo
    const inProgressPercentage =
      activeProjects > 0 ? Math.round((inProgressProjects / activeProjects) * 100) : 0;

    return NextResponse.json(
      {
        stats: {
          activeProjects: {
            value: activeProjects,
            change: activeProjectsThisMonth,
            changeText: `+${activeProjectsThisMonth} este mes`,
            changePositive: activeProjectsThisMonth > 0,
          },
          inProgress: {
            value: inProgressProjects,
            change: null,
            changeText: `${inProgressPercentage}% del total`,
            changePositive: null,
          },
          completed: {
            value: completedProjects,
            change: completedThisMonth,
            changeText: `+${completedThisMonth} este mes`,
            changePositive: completedThisMonth > 0,
          },
          averageProgress: {
            value: averageProgress,
            change: progressDiff,
            changeText: progressDiff >= 0 ? `+${progressDiff}% vs mes anterior` : `${progressDiff}% vs mes anterior`,
            changePositive: progressDiff >= 0,
          },
        },
        recentActivity,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
