'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ProjectPhase, ProjectImage } from '@prisma/client';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import ImageUploader from './ImageUploader';
import ImageCard from './ImageCard';

interface ProjectGalleryProps {
  projectId: string;
  currentPhase: ProjectPhase;
  canUpload: boolean;
}

// Mapeo de fases a labels
const phaseLabels: Record<ProjectPhase, string> = {
  MEASUREMENT: 'Medición',
  DESIGN: 'Diseño',
  APPROVAL: 'Aprobación',
  INSTALLATION: 'Instalación',
  FINISHING: 'Acabados',
  DELIVERY: 'Entrega',
};

export default function ProjectGallery({
  projectId,
  currentPhase,
  canUpload,
}: ProjectGalleryProps) {
  const { data: session } = useSession();
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase | 'ALL'>('ALL');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'ADMIN';

  // Fetch imágenes al montar y cuando cambia el filtro
  useEffect(() => {
    fetchImages();
  }, [projectId, selectedPhase]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const url = selectedPhase === 'ALL'
        ? `/api/projects/${projectId}/images`
        : `/api/projects/${projectId}/images?phase=${selectedPhase}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Error obteniendo imágenes');
      }

      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Error cargando imágenes');
    } finally {
      setLoading(false);
    }
  };

  // Callback cuando se sube una nueva imagen
  const handleUploadSuccess = (newImage: ProjectImage) => {
    setImages((prev) => [newImage, ...prev]);
  };

  // Eliminar imagen
  const handleDeleteImage = async (imageId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error eliminando imagen');
      }

      toast.success('Imagen eliminada exitosamente');
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
    }
  };

  // Abrir lightbox
  const handleImageClick = (imageUrl: string) => {
    setLightboxImage(imageUrl);
  };

  // Cerrar lightbox
  const handleCloseLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Galería de Progreso</h2>

        {/* Filtro por fase */}
        <select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value as ProjectPhase | 'ALL')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">Todas las fases</option>
          {Object.entries(phaseLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Uploader (solo si canUpload es true) */}
      {canUpload && (
        <div className="mb-6">
          <ImageUploader
            projectId={projectId}
            phase={currentPhase}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : images.length > 0 ? (
        // Grid de imágenes
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              onClick={() => handleImageClick(image.url)}
              canDelete={isAdmin}
              onDelete={handleDeleteImage}
            />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">No hay imágenes aún</p>
          <p className="text-gray-500 text-sm mt-1">
            {canUpload
              ? 'Sube la primera imagen usando el formulario de arriba'
              : 'Las imágenes aparecerán aquí cuando se suban'}
          </p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxImage && (
        <div
          onClick={handleCloseLightbox}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        >
          {/* Botón cerrar */}
          <button
            onClick={handleCloseLightbox}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
            title="Cerrar"
          >
            <X size={24} className="text-gray-900" />
          </button>

          {/* Imagen */}
          <img
            src={lightboxImage}
            alt="Vista ampliada"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
