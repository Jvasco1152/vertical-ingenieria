'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ProjectFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  search: string;
  status: string;
  currentPhase: string;
  clientId: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface Client {
  id: string;
  name: string;
}

export default function ProjectFilters({ onFilterChange }: ProjectFiltersProps) {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'ALL',
    currentPhase: 'ALL',
    clientId: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch clientes si es ADMIN
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchClients();
    }
  }, [session]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/users?role=CLIENT');
      if (response.ok) {
        const data = await response.json();
        setClients(data.users);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    // Debounce la búsqueda
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...filters, search: value });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      status: 'ALL',
      currentPhase: 'ALL',
      clientId: 'ALL',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'ALL' ||
    filters.currentPhase !== 'ALL' ||
    filters.clientId !== 'ALL' ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'desc';

  return (
    <div className="mb-6 space-y-4">
      {/* Barra de búsqueda y botón de filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar proyectos por título, descripción o ubicación..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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

        {/* Botón limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <X size={18} />
            Limpiar
          </button>
        )}
      </div>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="IN_PROGRESS">En Progreso</option>
                <option value="PAUSED">Pausado</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            {/* Filtro por fase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fase
              </label>
              <select
                value={filters.currentPhase}
                onChange={(e) => handleFilterChange('currentPhase', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="ALL">Todas las fases</option>
                <option value="MEASUREMENT">Medición</option>
                <option value="DESIGN">Diseño</option>
                <option value="APPROVAL">Aprobación</option>
                <option value="INSTALLATION">Instalación</option>
                <option value="FINISHING">Acabados</option>
                <option value="DELIVERY">Entrega</option>
              </select>
            </div>

            {/* Filtro por cliente (solo ADMIN) */}
            {session?.user?.role === 'ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cliente
                </label>
                <select
                  value={filters.clientId}
                  onChange={(e) => handleFilterChange('clientId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="ALL">Todos los clientes</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Ordenar por
              </label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="createdAt">Fecha de creación</option>
                  <option value="updatedAt">Última actualización</option>
                  <option value="title">Título</option>
                  <option value="progress">Progreso</option>
                </select>
                <button
                  onClick={() =>
                    handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                  title={filters.sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                >
                  <ArrowUpDown
                    size={18}
                    className={`transition-transform ${
                      filters.sortOrder === 'asc' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
