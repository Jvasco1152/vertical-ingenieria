import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createUserSchema } from '@/lib/validations/user';
import { hash } from 'bcryptjs';
import { z } from 'zod';

/**
 * GET /api/users
 * Obtiene usuarios filtrados por rol y búsqueda
 * Query params:
 * - role: Filtrar por rol (ADMIN, WORKER, CLIENT)
 * - search: Buscar por nombre o email
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo ADMIN puede listar usuarios
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden listar usuarios' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Construir filtro
    const where: any = {};

    if (role && role !== 'ALL' && ['CLIENT', 'WORKER', 'ADMIN'].includes(role)) {
      where.role = role;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            projectsAsClient: true,
            projectsAsWorker: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Crea un nuevo usuario
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo ADMIN puede crear usuarios
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden crear usuarios' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validar datos con Zod
    const validatedData = createUserSchema.parse(body);

    // Verificar que el email no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hash(validatedData.password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        phone: validatedData.phone || null,
        image: validatedData.image || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
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

    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
