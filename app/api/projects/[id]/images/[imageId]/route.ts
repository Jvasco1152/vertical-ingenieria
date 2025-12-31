import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteImageFromCloudinary } from '@/lib/cloudinary';

/**
 * DELETE /api/projects/[id]/images/[imageId]
 * Elimina una imagen tanto de Cloudinary como de la base de datos
 * Solo accesible por usuarios ADMIN
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Solo ADMIN puede eliminar imágenes
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores pueden eliminar imágenes' },
        { status: 403 }
      );
    }

    // Await params (Next.js 15+)
    const { id, imageId } = await params;

    // Buscar la imagen en la base de datos
    const image = await prisma.projectImage.findUnique({
      where: {
        id: imageId,
      },
    });

    if (!image) {
      return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
    }

    // Verificar que la imagen pertenece al proyecto especificado
    if (image.projectId !== id) {
      return NextResponse.json(
        { error: 'La imagen no pertenece a este proyecto' },
        { status: 400 }
      );
    }

    // Eliminar de Cloudinary primero (si tiene publicId)
    if (image.publicId) {
      try {
        await deleteImageFromCloudinary(image.publicId);
      } catch (cloudinaryError) {
        console.error('Error eliminando de Cloudinary:', cloudinaryError);
        // Continuar con la eliminación de BD aunque Cloudinary falle
        // (la imagen podría no existir en Cloudinary)
      }
    }

    // Eliminar de la base de datos
    await prisma.projectImage.delete({
      where: {
        id: imageId,
      },
    });

    return NextResponse.json(
      { message: 'Imagen eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
