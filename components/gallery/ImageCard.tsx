'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Calendar, User, ExternalLink, Download } from 'lucide-react';

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    description: string | null;
    createdAt: Date;
    uploadedBy: string;
    project: {
      id: string;
      title: string;
      location: string;
      status: string;
      currentPhase: string;
      client: {
        name: string;
      };
    };
  };
  onClick: () => void;
}

export default function ImageCard({ image, onClick }: ImageCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getPhaseText = (phase: string) => {
    const phases: Record<string, string> = {
      MEASUREMENT: 'Medición',
      DESIGN: 'Diseño',
      APPROVAL: 'Aprobación',
      INSTALLATION: 'Instalación',
      FINISHING: 'Acabados',
      DELIVERY: 'Entrega',
    };
    return phases[phase] || phase;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.project.title}-${image.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Imagen */}
      <div
        className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden"
        onClick={onClick}
      >
        {!imageError ? (
          <Image
            src={image.url}
            alt={image.description || image.project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <svg
                className="mx-auto mb-2 text-gray-400"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <p className="text-sm text-gray-500">Error cargando imagen</p>
            </div>
          </div>
        )}

        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            <Link
              href={`/projects/${image.project.id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
              title="Ver proyecto"
            >
              <ExternalLink size={18} className="text-gray-700" />
            </Link>
            <button
              onClick={handleDownload}
              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
              title="Descargar imagen"
            >
              <Download size={18} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Información */}
      <div className="p-4">
        <div className="mb-3">
          <Link
            href={`/projects/${image.project.id}`}
            className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
          >
            {image.project.title}
          </Link>
          {image.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{image.description}</p>
          )}
        </div>

        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span className="truncate">{image.project.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{formatDate(image.createdAt)}</span>
            <span>•</span>
            <span className="truncate">{getPhaseText(image.project.currentPhase)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
