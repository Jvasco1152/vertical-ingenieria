/**
 * Respuesta de Cloudinary después de un upload exitoso
 */
export interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

/**
 * Datos de firma obtenidos del backend
 */
interface SignatureData {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
}

/**
 * Sube una imagen directamente a Cloudinary con tracking de progreso
 * Usa signed upload con firma de seguridad del backend
 * @param file - Archivo a subir
 * @param onProgress - Callback opcional para tracking de progreso (0-100)
 * @returns Respuesta de Cloudinary con URL y publicId
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResponse> {
  // 1. Obtener firma de seguridad del backend
  const signResponse = await fetch('/api/cloudinary/sign', {
    method: 'POST',
  });

  if (!signResponse.ok) {
    const error = await signResponse.json();
    throw new Error(error.error || 'Error obteniendo firma de seguridad');
  }

  const signData: SignatureData = await signResponse.json();

  // 2. Preparar FormData para Cloudinary (signed upload)
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.apiKey);
  formData.append('timestamp', signData.timestamp.toString());
  formData.append('signature', signData.signature);
  formData.append('folder', signData.folder);

  // 3. Upload a Cloudinary con XMLHttpRequest para progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Listener para progreso de upload
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    // Listener para completado
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response: CloudinaryUploadResponse = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Error parseando respuesta de Cloudinary'));
        }
      } else {
        // Incluir más detalles del error
        try {
          const errorData = JSON.parse(xhr.responseText);
          reject(new Error(`Upload falló: ${errorData.error?.message || xhr.statusText}`));
        } catch {
          reject(new Error(`Upload falló con status ${xhr.status}`));
        }
      }
    });

    // Listener para errores
    xhr.addEventListener('error', () => {
      reject(new Error('Error de red durante el upload'));
    });

    // Listener para abort
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelado'));
    });

    // Enviar request (signed upload)
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`);
    xhr.send(formData);
  });
}

/**
 * Valida que un archivo sea una imagen válida
 * @param file - Archivo a validar
 * @returns Objeto con resultado de validación y mensaje de error si aplica
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB en bytes

  // Validar tipo de archivo
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG o WEBP',
    };
  }

  // Validar tamaño
  if (file.size > maxSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Archivo muy grande (${sizeMB}MB). El tamaño máximo permitido es 5MB`,
    };
  }

  return { valid: true };
}

/**
 * Convierte un File a una URL de datos para preview
 * @param file - Archivo a convertir
 * @returns Promise con la URL de datos
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Error leyendo archivo'));
      }
    };
    reader.onerror = () => reject(new Error('Error leyendo archivo'));
    reader.readAsDataURL(file);
  });
}
