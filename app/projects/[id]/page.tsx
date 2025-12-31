import { MapPin, Calendar, User, TrendingUp } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProjectGallery from '@/components/projects/ProjectGallery';
import ProjectActions from '@/components/projects/ProjectActions';
import CommentList from '@/components/comments/CommentList';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params (Next.js 15+)
  const { id } = await params;

  // Obtener sesión para verificar permisos
  const session = await getServerSession(authOptions);

  // Fetch proyecto desde base de datos
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      workers: {
        include: {
          worker: true,
        },
      },
    },
  });

  // Si no existe el proyecto, mostrar 404
  if (!project) {
    notFound();
  }

  // Verificar si el usuario puede subir imágenes
  const canUpload = session?.user?.role === 'ADMIN' || session?.user?.role === 'WORKER';

  // Verificar si es admin para mostrar botones de editar/eliminar
  const isAdmin = session?.user?.role === 'ADMIN';

  // Helper para obtener el badge de estado
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pendiente', className: 'bg-gray-50 text-gray-700 border border-gray-200' },
      IN_PROGRESS: { label: 'En Progreso', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
      PAUSED: { label: 'Pausado', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
      COMPLETED: { label: 'Completado', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      CANCELLED: { label: 'Cancelado', className: 'bg-red-50 text-red-700 border border-red-200' },
    };
    return badges[status] || badges.PENDING;
  };

  const phaseLabels: Record<string, string> = {
    MEASUREMENT: 'Medición',
    DESIGN: 'Diseño',
    APPROVAL: 'Aprobación',
    INSTALLATION: 'Instalación',
    FINISHING: 'Acabados',
    DELIVERY: 'Entrega',
  };

  const statusBadge = getStatusBadge(project.status);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {isAdmin && <ProjectActions projectId={project.id} projectTitle={project.title} />}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <MapPin size={16} strokeWidth={2} className="text-gray-400" />
            {project.location}
          </span>
          {project.startDate && (
            <span className="flex items-center gap-1.5">
              <Calendar size={16} strokeWidth={2} className="text-gray-400" />
              Inicio: {new Date(project.startDate).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">
          {/* Información general */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
            <p className="text-gray-700 leading-relaxed">{project.description}</p>
          </div>

          {/* Progreso */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Progreso del Proyecto</h2>
            <div className="mb-5">
              <div className="flex justify-between text-sm mb-2.5">
                <span className="text-gray-600 font-medium">Avance General</span>
                <span className="font-bold text-gray-900">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
              <TrendingUp size={18} strokeWidth={2} className="text-gray-400" />
              <span>Fase actual: <span className="font-semibold text-gray-900">{phaseLabels[project.currentPhase]}</span></span>
            </div>
          </div>

          {/* Galería de imágenes */}
          <ProjectGallery
            projectId={project.id}
            currentPhase={project.currentPhase}
            canUpload={canUpload}
          />

          {/* Comentarios */}
          <CommentList projectId={project.id} />
        </div>

        {/* Barra lateral */}
        <div className="space-y-5">
          {/* Información del cliente */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User size={18} strokeWidth={2} className="text-blue-600" />
              </div>
              Cliente
            </h3>
            <div className="space-y-2.5 text-sm">
              <p className="font-semibold text-gray-900">{project.client.name}</p>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-xs text-gray-400">✉</span>
                {project.client.email}
              </p>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="text-xs text-gray-400">📞</span>
                {project.client.phone}
              </p>
            </div>
          </div>

          {/* Equipo de trabajo */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Equipo de Trabajo</h3>
            <div className="space-y-3">
              {project.workers.length > 0 ? (
                project.workers.map((projectWorker) => (
                  <div key={projectWorker.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                      {projectWorker.worker.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{projectWorker.worker.name}</p>
                      <p className="text-xs text-gray-500 truncate">{projectWorker.worker.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">No hay trabajadores asignados</p>
                </div>
              )}
            </div>
          </div>

          {/* Detalles */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Detalles</h3>
            <div className="space-y-4 text-sm">
              <div className="pb-3 border-b border-gray-100">
                <p className="text-gray-500 text-xs font-medium mb-1.5">Estado</p>
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>
              {project.budget && (
                <div className="pb-3 border-b border-gray-100">
                  <p className="text-gray-500 text-xs font-medium mb-1.5">Presupuesto</p>
                  <p className="font-semibold text-gray-900">${project.budget.toLocaleString()}</p>
                </div>
              )}
              {project.estimatedEndDate && (
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-1.5">Fecha Estimada</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(project.estimatedEndDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
