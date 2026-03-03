import { NextResponse } from 'next/server';
import { generatePublicUploadSignature } from '@/lib/cloudinary';

/**
 * POST /api/cloudinary/sign-public
 * Genera una firma para upload de imágenes desde el formulario público de cotización.
 * No requiere autenticación. Sube a la carpeta 'vertical_quote_requests'.
 */
export async function POST() {
  try {
    const signatureData = generatePublicUploadSignature();
    return NextResponse.json(signatureData, { status: 200 });
  } catch (error) {
    console.error('Error generando firma pública de Cloudinary:', error);
    return NextResponse.json(
      { error: 'Error al generar firma de upload' },
      { status: 500 }
    );
  }
}
