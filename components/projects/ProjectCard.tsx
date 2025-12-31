import Link from 'next/link';
import { Calendar, MapPin, TrendingUp } from 'lucide-react';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  progress: number;
  currentPhase: string;
  estimatedEndDate?: Date | null;
}

export default function ProjectCard({
  id,
  title,
  description,
  location,
  status,
  progress,
  currentPhase,
  estimatedEndDate,
}: ProjectCardProps) {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-gray-50 text-gray-700 border border-gray-200',
    IN_PROGRESS: 'bg-blue-50 text-blue-700 border border-blue-200',
    PAUSED: 'bg-amber-50 text-amber-700 border border-amber-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    PAUSED: 'Pausado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
  };

  const phaseLabels: Record<string, string> = {
    MEASUREMENT: 'Medición',
    DESIGN: 'Diseño',
    APPROVAL: 'Aprobación',
    INSTALLATION: 'Instalación',
    FINISHING: 'Acabados',
    DELIVERY: 'Entrega',
  };

  return (
    <Link href={`/projects/${id}`}>
      <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:-translate-y-1">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3 gap-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-5 line-clamp-2 leading-relaxed">{description}</p>

          <div className="space-y-2.5 mb-5">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin size={16} strokeWidth={2} className="mr-2 text-gray-400" />
              <span className="line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp size={16} strokeWidth={2} className="mr-2 text-gray-400" />
              <span>Fase: {phaseLabels[currentPhase]}</span>
            </div>
            {estimatedEndDate && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} strokeWidth={2} className="mr-2 text-gray-400" />
                <span>{new Date(estimatedEndDate).toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>

          {/* Barra de progreso */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500 font-medium">Progreso</span>
              <span className="font-semibold text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
