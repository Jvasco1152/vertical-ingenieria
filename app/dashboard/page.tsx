'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  activeProjects: {
    value: number;
    change: number;
    changeText: string;
    changePositive: boolean;
  };
  inProgress: {
    value: number;
    change: null;
    changeText: string;
    changePositive: null;
  };
  completed: {
    value: number;
    change: number;
    changeText: string;
    changePositive: boolean;
  };
  averageProgress: {
    value: number;
    change: number;
    changeText: string;
    changePositive: boolean;
  };
}

interface RecentProject {
  id: string;
  title: string;
  status: string;
  currentPhase: string;
  progress: number;
  updatedAt: Date;
  client: {
    name: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');

      if (!response.ok) {
        throw new Error('Error obteniendo datos del dashboard');
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      name: 'Proyectos Activos',
      key: 'activeProjects' as const,
      icon: Briefcase,
      gradient: 'from-blue-500 to-blue-600',
      bgLight: 'bg-gradient-to-br from-blue-50 to-blue-100',
      textColor: 'text-blue-600',
      ringColor: 'ring-blue-200',
    },
    {
      name: 'En Progreso',
      key: 'inProgress' as const,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgLight: 'bg-gradient-to-br from-amber-50 to-orange-100',
      textColor: 'text-orange-600',
      ringColor: 'ring-orange-200',
    },
    {
      name: 'Completados',
      key: 'completed' as const,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-green-600',
      bgLight: 'bg-gradient-to-br from-emerald-50 to-green-100',
      textColor: 'text-emerald-600',
      ringColor: 'ring-emerald-200',
    },
    {
      name: 'Avance Promedio',
      key: 'averageProgress' as const,
      icon: TrendingUp,
      gradient: 'from-violet-500 to-purple-600',
      bgLight: 'bg-gradient-to-br from-violet-50 to-purple-100',
      textColor: 'text-violet-600',
      ringColor: 'ring-violet-200',
    },
  ];

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1.5">Bienvenido al sistema de gestión de proyectos</p>
        </div>

        {/* Skeleton loader */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md border-2 border-gray-100 p-6 animate-pulse">
              <div className="h-14 w-14 bg-gray-200 rounded-xl mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-6 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1.5">Bienvenido al sistema de gestión de proyectos</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statsConfig.map((config) => {
          const Icon = config.icon;
          const statData = stats?.[config.key];
          const value = config.key === 'averageProgress'
            ? `${statData?.value || 0}%`
            : statData?.value?.toString() || '0';

          return (
            <div
              key={config.name}
              className={`group bg-white rounded-2xl shadow-md hover:shadow-xl border-2 border-gray-100 hover:${config.ringColor} hover:ring-2 p-6 transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${config.bgLight} p-4 rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                  <Icon className={config.textColor} size={24} strokeWidth={2.5} />
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{config.name}</p>
                <p className={`text-4xl font-black mb-3 bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent`}>
                  {value}
                </p>
                <div className={`text-xs font-bold ${statData?.changePositive ? 'text-emerald-600' : 'text-gray-600'} flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full w-fit`}>
                  {statData?.changePositive && (
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  )}
                  {statData?.changeText || 'Sin cambios'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección de actividad reciente */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl shadow-md border-2 border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
            <Clock className="text-white" size={20} strokeWidth={2.5} />
          </div>
          Actividad Reciente
        </h2>

        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{project.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{project.client.name}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                      <span className="text-gray-500">{getPhaseText(project.currentPhase)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">{project.progress}% completado</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">
                      {getRelativeTime(new Date(project.updatedAt))}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border-2 border-blue-200">
                <Clock className="text-blue-500" size={32} strokeWidth={2} />
              </div>
              <p className="text-gray-600 text-base font-medium">No hay actividad reciente</p>
              <p className="text-gray-400 text-sm mt-2">Los proyectos actualizados aparecerán aquí</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-gray-100 text-gray-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    PAUSED: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

function getStatusText(status: string) {
  const texts: Record<string, string> = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    PAUSED: 'Pausado',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
  };
  return texts[status] || status;
}

function getPhaseText(phase: string) {
  const texts: Record<string, string> = {
    MEASUREMENT: 'Medición',
    DESIGN: 'Diseño',
    APPROVAL: 'Aprobación',
    INSTALLATION: 'Instalación',
    FINISHING: 'Acabados',
    DELIVERY: 'Entrega',
  };
  return texts[phase] || phase;
}

function getRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return 'hace un momento';
}
