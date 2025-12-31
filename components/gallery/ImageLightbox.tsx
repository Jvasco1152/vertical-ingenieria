'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';

interface ImageLightboxProps {
  images: Array<{
    id: string;
    url: string;
    description: string | null;
    createdAt: Date;
    uploadedBy: string;
    project: {
      id: string;
      title: string;
      location: string;
    };
  }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export default function ImageLightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrevious,
}: ImageLightboxProps) {
  const currentImage = images[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrevious();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious]);

  const handleDownload = async () => {
    try {
      const response = await fetch(currentImage.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentImage.project.title}-${currentImage.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent z-10">
        <div className="flex items-center gap-4">
          <Link
            href={`/projects/${currentImage.project.id}`}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm"
          >
            <ExternalLink size={18} />
            <span className="text-sm font-medium">Ver proyecto</span>
          </Link>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm"
          >
            <Download size={18} />
            <span className="text-sm font-medium">Descargar</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm z-10"
            disabled={currentIndex === 0}
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm z-10"
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Image */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto p-4 flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={currentImage.url}
            alt={currentImage.description || currentImage.project.title}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent z-10">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-white text-xl font-semibold mb-1">
            {currentImage.project.title}
          </h3>
          {currentImage.description && (
            <p className="text-white/80 text-sm mb-2">{currentImage.description}</p>
          )}
          <div className="flex items-center gap-4 text-white/60 text-sm">
            <span>{currentImage.project.location}</span>
            <span>•</span>
            <span>
              {currentIndex + 1} de {images.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
