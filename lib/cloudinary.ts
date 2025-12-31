import { v2 as cloudinary } from 'cloudinary';

// Configuración global de Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

/**
 * Genera una firma segura para upload directo a Cloudinary desde el frontend
 * @returns Objeto con signature, timestamp y datos necesarios para el upload
 */
export function generateUploadSignature() {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'vertical_projects';

  // Generar firma con los parámetros de upload
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    signature,
    timestamp,
    folder,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  };
}

/**
 * Elimina una imagen de Cloudinary
 * @param publicId - Public ID de la imagen en Cloudinary
 * @returns Resultado de la operación de eliminación
 */
export async function deleteImageFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    throw new Error('Error eliminando imagen de Cloudinary');
  }
}
