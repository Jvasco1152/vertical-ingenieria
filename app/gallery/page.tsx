'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import ImageCard from '@/components/gallery/ImageCard';
import ImageLightbox from '@/components/gallery/ImageLightbox';
import { Search, Filter, Loader2, Image as ImageIcon, ArrowUpDown } from 'lucide-react';

interface GalleryImage {
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
}

interface Project {
  id: string;
  title: string;
}

export default function GalleryPage() {
  const { data: session } = useSession();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchImages();
  }, [search, projectFilter, sortOrder]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (projectFilter !== 'ALL') params.append('projectId', projectFilter);
      params.append('sortBy', 'createdAt');
      params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/gallery?${params.toString()}`);

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

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
  };

  const handleLightboxClose = () => {
    setLightboxIndex(null);
  };

  const handleLightboxNext = () => {
    if (lightboxIndex !== null && lightboxIndex < images.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const handleLightboxPrevious = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const hasActiveFilters = search !== '' || projectFilter !== 'ALL' || sortOrder !== 'desc';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Galería</h1>
          <p className="text-gray-600 mt-2">Explora todas las imágenes de los proyectos</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre de proyecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
              hasActiveFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                Activos
              </span>
            )}
          </button>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Filtro por proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Proyecto
                </label>
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="ALL">Todos los proyectos</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ordenamiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ordenar por fecha
                </label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between bg-white"
                >
                  <span>{sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}</span>
                  <ArrowUpDown
                    size={18}
                    className={`transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando imágenes...</p>
          </div>
        </div>
      )}

      {/* Grid de imágenes */}
      {!loading && (
        <>
          {images.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onClick={() => handleImageClick(index)}
                  />
                ))}
              </div>

              {/* Contador de resultados */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-semibold">{images.length}</span>{' '}
                  {images.length === 1 ? 'imagen' : 'imágenes'}
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={32} />
              </div>
              {hasActiveFilters ? (
                <>
                  <p className="text-gray-600 font-medium mb-2">No se encontraron imágenes</p>
                  <p className="text-gray-500 text-sm">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 font-medium mb-2">No hay imágenes aún</p>
                  <p className="text-gray-500 text-sm">
                    Las imágenes de los proyectos aparecerán aquí
                  </p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={handleLightboxClose}
          onNext={handleLightboxNext}
          onPrevious={handleLightboxPrevious}
        />
      )}
    </div>
  );
}
