'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { ProjectStatus, ProjectPhase, User } from '@prisma/client';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: ProjectFormData;
}

export interface ProjectFormData {
  title: string;
  description: string;
  location: string;
  clientId: string;
  status: ProjectStatus;
  currentPhase: ProjectPhase;
  progress: number;
  startDate: string;
  estimatedEndDate: string;
  budget: number | null;
  workerIds: string[];
}

const statusLabels: Record<ProjectStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

const phaseLabels: Record<ProjectPhase, string> = {
  MEASUREMENT: 'Medición',
  DESIGN: 'Diseño',
  APPROVAL: 'Aprobación',
  INSTALLATION: 'Instalación',
  FINISHING: 'Acabados',
  DELIVERY: 'Entrega',
};

export default function ProjectForm({ mode, projectId, initialData }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<User[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      title: '',
      description: '',
      location: '',
      clientId: '',
      status: 'PENDING',
      currentPhase: 'MEASUREMENT',
      progress: 0,
      startDate: '',
      estimatedEndDate: '',
      budget: null,
      workerIds: [],
    }
  );

  // Cargar clientes y trabajadores
  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      // TODO: Crear API route para obtener usuarios
      // Por ahora, usaremos datos de prueba o haremos fetch directo
      const response = await fetch('/api/users?role=CLIENT');
      if (response.ok) {
        const data = await response.json();
        setClients(data.users || []);
      }

      const workersResponse = await fetch('/api/users?role=WORKER');
      if (workersResponse.ok) {
        const data = await workersResponse.json();
        setWorkers(data.users || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;

    // Convertir números (input type="number" y type="range")
    if (type === 'number' || type === 'range') {
      processedValue = value === '' ? null : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleWorkersChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({
      ...prev,
      workerIds: selectedOptions,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para envío - asegurar tipos correctos
      const submitData = {
        ...formData,
        // Asegurar que progress sea número
        progress: typeof formData.progress === 'string'
          ? parseFloat(formData.progress)
          : formData.progress,
        // Asegurar que budget sea número o null
        budget: !formData.budget
          ? null
          : typeof formData.budget === 'string'
          ? parseFloat(formData.budget)
          : formData.budget,
        // Convertir fechas a ISO string si están presentes
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
        estimatedEndDate: formData.estimatedEndDate
          ? new Date(formData.estimatedEndDate).toISOString()
          : '',
      };

      const url = mode === 'create' ? '/api/projects' : `/api/projects/${projectId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar el proyecto');
      }

      const project = await response.json();

      toast.success(
        mode === 'create' ? 'Proyecto creado exitosamente' : 'Proyecto actualizado exitosamente'
      );

      // Redirigir al detalle del proyecto
      router.push(`/projects/${project.id}`);
    } catch (error) {
      console.error('Error guardando proyecto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>

        <div className="space-y-4">
          {/* Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título del Proyecto *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Modernización Edificio Corporativo"
            />
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe el proyecto en detalle..."
            />
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Av. Principal 123, Ciudad"
            />
          </div>

          {/* Cliente */}
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estado y Progreso */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado y Progreso</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Fase */}
          <div>
            <label htmlFor="currentPhase" className="block text-sm font-medium text-gray-700 mb-2">
              Fase Actual
            </label>
            <select
              id="currentPhase"
              name="currentPhase"
              value={formData.currentPhase}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(phaseLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Progreso */}
          <div className="md:col-span-2">
            <label htmlFor="progress" className="block text-sm font-medium text-gray-700 mb-2">
              Progreso: {formData.progress}%
            </label>
            <input
              type="range"
              id="progress"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
                style={{ width: `${formData.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Equipo y Fechas */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Equipo y Fechas</h2>

        <div className="space-y-4">
          {/* Trabajadores */}
          <div>
            <label htmlFor="workerIds" className="block text-sm font-medium text-gray-700 mb-2">
              Trabajadores Asignados
            </label>
            <select
              id="workerIds"
              name="workerIds"
              multiple
              value={formData.workerIds}
              onChange={handleWorkersChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
            >
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} - {worker.email}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Mantén presionada la tecla Ctrl (Cmd en Mac) para seleccionar múltiples trabajadores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha de Inicio */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fecha Estimada de Finalización */}
            <div>
              <label
                htmlFor="estimatedEndDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha Estimada de Finalización
              </label>
              <input
                type="date"
                id="estimatedEndDate"
                name="estimatedEndDate"
                value={formData.estimatedEndDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Presupuesto */}
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
              Presupuesto ($)
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={formData.budget || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
          {mode === 'create' ? 'Crear Proyecto' : 'Guardar Cambios'}
        </Button>
      </div>
    </form>
  );
}
