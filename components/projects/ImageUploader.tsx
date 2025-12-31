'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ProjectPhase, ProjectImage } from '@prisma/client';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { uploadToCloudinary, validateImageFile, fileToDataURL } from '@/lib/upload';

interface ImageUploaderProps {
  projectId: string;
  phase: ProjectPhase;
  onUploadSuccess: (image: ProjectImage) => void;
  onUploadError?: (error: string) => void;
}

export default function ImageUploader({
  projectId,
  phase,
  onUploadSuccess,
  onUploadError,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejar selección de archivo
  const handleFileSelect = async (file: File) => {
    // Validar archivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error!);
      return;
    }

    // Generar preview
    try {
      const dataUrl = await fileToDataURL(file);
      setSelectedFile(file);
      setPreviewUrl(dataUrl);
    } catch (error) {
      toast.error('Error al cargar preview de la imagen');
    }
  };

  // Manejar click en zona de drop
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Manejar cambio en input file
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Manejar drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Manejar drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Manejar drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Cancelar selección
  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Subir imagen
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Subir a Cloudinary con progress tracking
      const cloudinaryResponse = await uploadToCloudinary(
        selectedFile,
        (progress) => setUploadProgress(progress)
      );

      // 2. Guardar metadatos en base de datos
      const response = await fetch(`/api/projects/${projectId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: cloudinaryResponse.secure_url,
          publicId: cloudinaryResponse.public_id,
          phase,
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error guardando imagen');
      }

      const savedImage: ProjectImage = await response.json();

      // 3. Éxito
      toast.success('Imagen subida exitosamente');
      onUploadSuccess(savedImage);

      // 4. Reset
      handleCancel();
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error subiendo imagen: ${errorMessage}`);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6">
      {!selectedFile ? (
        // Estado inicial: Drop zone
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center py-8 cursor-pointer transition-colors duration-200 ${
            isDragging ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'
          }`}
        >
          <Upload
            size={48}
            className={`mb-4 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`}
          />
          <p className="text-lg font-medium text-gray-700 mb-1">
            Arrastra una imagen aquí o haz click para seleccionar
          </p>
          <p className="text-sm text-gray-500">
            JPG, PNG, WEBP (máximo 5MB)
          </p>

          {/* Input oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        // Estado: Archivo seleccionado
        <div className="space-y-4">
          {/* Preview de imagen */}
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain"
              />
            )}

            {/* Botón cancelar */}
            {!uploading && (
              <button
                onClick={handleCancel}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Cancelar"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Información del archivo */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ImageIcon size={16} />
            <span className="font-medium">{selectedFile.name}</span>
            <span className="text-gray-400">
              ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </span>
          </div>

          {/* Input descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
              rows={3}
              maxLength={500}
              placeholder="Describe la imagen (ej: Instalación piso 3, acabado final, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 caracteres
            </p>
          </div>

          {/* Progress bar (solo cuando está subiendo) */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleUpload}
              isLoading={uploading}
              disabled={uploading}
              className="flex-1"
            >
              Subir Imagen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
