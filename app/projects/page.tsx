'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectFilters, { FilterState } from '@/components/projects/ProjectFilters';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  currentPhase: string;
  progress: number;
  startDate: Date | null;
  estimatedEndDate: Date | null;
  actualEndDate: Date | null;
  budget: number | null;
  createdAt: Date;
  updatedAt: Date;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  workers: Array<{
    worker: {
      id: string;
      name: string;
      email: string;
    };
  }>;
  _count: {
    images: number;
    comments: number;
  };
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    currentPhase: 'ALL',
    clientId: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      // Construir query params
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.currentPhase !== 'ALL') params.append('currentPhase', filters.currentPhase);
      if (filters.clientId !== 'ALL') params.append('clientId', filters.clientId);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/projects?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error obteniendo proyectos');
      }

      const data = await response.json();
      setProjects(data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const canCreateProjects = session?.user?.role === 'ADMIN';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-600 mt-2">Gestiona todos tus proyectos de diseño de ascensores</p>
        </div>
        {canCreateProjects && (
          <Link href="/projects/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus size={20} />
              Nuevo Proyecto
            </Button>
          </Link>
        )}
      </div>

      {/* Filtros */}
      <ProjectFilters onFilterChange={handleFilterChange} />

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando proyectos...</p>
          </div>
        </div>
      )}

      {/* Grid de proyectos */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectCard key={project.id} {...project} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="text-gray-400" size={32} />
              </div>
              {filters.search || filters.status !== 'ALL' || filters.currentPhase !== 'ALL' ? (
                <>
                  <p className="text-gray-600 font-medium mb-2">No se encontraron proyectos</p>
                  <p className="text-gray-500 text-sm">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 font-medium mb-4">No hay proyectos aún</p>
                  {canCreateProjects && (
                    <Link href="/projects/new">
                      <Button variant="primary">Crear primer proyecto</Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && projects.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{projects.length}</span>{' '}
            {projects.length === 1 ? 'proyecto' : 'proyectos'}
          </p>
        </div>
      )}
    </div>
  );
}
