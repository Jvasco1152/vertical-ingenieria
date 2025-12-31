import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateCommentSchema } from '@/lib/validations/comment';
import { z } from 'zod';

/**
 * PUT /api/comments/[id]
 * Actualiza un comentario
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

    const { id } = await params;
    const body = await req.json();

    // Validar datos
    const validatedData = updateCommentSchema.parse(body);

    // Verificar que el comentario existe
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
    }

    // Solo el autor o ADMIN pueden editar
    if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos para editar este comentario' },
        { status: 403 }
      );
    }

    // Actualizar comentario
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: validatedData.content,
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

    return NextResponse.json(updatedComment, { status: 200 });
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

    console.error('Error actualizando comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/comments/[id]
 * Elimina un comentario
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

    const { id } = await params;

    // Verificar que el comentario existe
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
    }

    // Solo el autor o ADMIN pueden eliminar
    if (comment.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos para eliminar este comentario' },
        { status: 403 }
      );
    }

    // Eliminar comentario
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Comentario eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error eliminando comentario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
