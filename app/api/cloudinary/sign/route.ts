import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateUploadSignature } from '@/lib/cloudinary';

/**
 * POST /api/cloudinary/sign
 * Genera una firma segura para upload directo a Cloudinary desde el frontend
 * Solo accesible por usuarios ADMIN y WORKER autenticados
 */
export async function POST() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado. Debes iniciar sesión para subir imágenes' },
        { status: 401 }
      );
    }

    // Verificar rol - solo ADMIN y WORKER pueden subir imágenes
    if (!['ADMIN', 'WORKER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos. Solo administradores y trabajadores pueden subir imágenes' },
        { status: 403 }
      );
    }

    // Generar firma
    const signatureData = generateUploadSignature();

    return NextResponse.json(signatureData, { status: 200 });
  } catch (error) {
    console.error('Error generando firma de Cloudinary:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al generar firma de upload' },
      { status: 500 }
    );
  }
}
