'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { ProjectImage, ProjectPhase } from '@prisma/client';

interface ImageCardProps {
  image: ProjectImage;
  onClick: () => void;
  canDelete?: boolean;
  onDelete?: (imageId: string) => void;
}

// Mapeo de fases a colores para los badges
const phaseColors: Record<ProjectPhase, string> = {
  MEASUREMENT: 'bg-gray-100 text-gray-800',
  DESIGN: 'bg-purple-100 text-purple-800',
  APPROVAL: 'bg-yellow-100 text-yellow-800',
  INSTALLATION: 'bg-blue-100 text-blue-800',
  FINISHING: 'bg-orange-100 text-orange-800',
  DELIVERY: 'bg-green-100 text-green-800',
};

// Mapeo de fases a labels en español
const phaseLabels: Record<ProjectPhase, string> = {
  MEASUREMENT: 'Medición',
  DESIGN: 'Diseño',
  APPROVAL: 'Aprobación',
  INSTALLATION: 'Instalación',
  FINISHING: 'Acabados',
  DELIVERY: 'Entrega',
};

export default function ImageCard({ image, onClick, canDelete, onDelete }: ImageCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que se abra el lightbox
    if (onDelete && window.confirm('¿Estás seguro de eliminar esta imagen?')) {
      onDelete(image.id);
    }
  };

  // Formatear fecha relativa
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <div
      onClick={onClick}
      className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      {/* Imagen */}
      <Image
        src={image.url}
        alt={image.description || 'Imagen del proyecto'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 50vw, 33vw"
      />

      {/* Overlay con información (visible on hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Descripción */}
          {image.description && (
            <p className="text-white text-sm font-medium mb-2 line-clamp-2">
              {image.description}
            </p>
          )}

          {/* Badge de fase */}
          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                phaseColors[image.phase]
              }`}
            >
              {phaseLabels[image.phase]}
            </span>

            {/* Fecha */}
            <span className="text-white text-xs">
              {formatDate(image.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Botón eliminar (solo si canDelete) */}
      {canDelete && onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all duration-200 z-10"
          title="Eliminar imagen"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
