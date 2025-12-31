import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateUserSchema } from '@/lib/validations/user';
import { hash } from 'bcryptjs';
import { z } from 'zod';

/**
 * GET /api/users/[id]
 * Obtiene un usuario específico
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

    // Solo ADMIN puede ver detalles de usuarios
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden ver usuarios' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id]
 * Actualiza un usuario existente
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

    // Solo ADMIN puede actualizar usuarios
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden actualizar usuarios' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Validar datos
    const validatedData = updateUserSchema.parse(body);

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (emailInUse) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.email && { email: validatedData.email }),
      ...(validatedData.role && { role: validatedData.role }),
      ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
      ...(validatedData.image !== undefined && { image: validatedData.image }),
    };

    // Si se proporciona contraseña, hashearla
    if (validatedData.password) {
      updateData.password = await hash(validatedData.password, 10);
    }

    // Actualizar usuario
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(user, { status: 200 });
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

    console.error('Error actualizando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Elimina un usuario
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

    // Solo ADMIN puede eliminar usuarios
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden eliminar usuarios' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // No permitir que un admin se elimine a sí mismo
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Usuario eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
