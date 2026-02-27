'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClipboardList, ChevronRight } from 'lucide-react';

type QuoteStatus = 'PENDING' | 'REVIEWED' | 'CONVERTED' | 'REJECTED';

interface Solicitud {
  id: string;
  email: string;
  tipoCliente: string;
  obraEdificio: string;
  ciudad: string;
  ciudadOtro: string | null;
  tipoCotizacion: string;
  status: QuoteStatus;
  createdAt: string;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: 'Pendiente',
  REVIEWED: 'Revisada',
  CONVERTED: 'Convertida',
  REJECTED: 'Rechazada',
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEWED: 'bg-blue-100 text-blue-800',
  CONVERTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const FILTERS: { label: string; value: string }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Pendiente', value: 'PENDING' },
  { label: 'Revisada', value: 'REVIEWED' },
  { label: 'Convertida', value: 'CONVERTED' },
  { label: 'Rechazada', value: 'REJECTED' },
];

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = activeFilter !== 'ALL' ? `?status=${activeFilter}` : '';
        const res = await fetch(`/api/solicitudes${params}`);
        if (!res.ok) throw new Error('Error al cargar las solicitudes');
        const data = await res.json();
        setSolicitudes(data.solicitudes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitudes();
  }, [activeFilter]);

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCiudadDisplay = (s: Solicitud) =>
    s.ciudad === 'Otro' && s.ciudadOtro ? s.ciudadOtro : s.ciudad;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
          <ClipboardList size={20} className="text-white" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Cotización</h1>
          <p className="text-sm text-gray-500">Gestiona las solicitudes recibidas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <ClipboardList size={40} className="mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
          <p className="font-medium">No hay solicitudes</p>
          <p className="text-sm mt-1">
            {activeFilter !== 'ALL'
              ? 'No hay solicitudes con este estado'
              : 'Aún no se han recibido solicitudes'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ciudad</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Tipo Cotización</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solicitudes.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-900 max-w-[180px] truncate">{s.email}</td>
                    <td className="px-4 py-3 text-gray-700">{s.tipoCliente}</td>
                    <td className="px-4 py-3 text-gray-700">{getCiudadDisplay(s)}</td>
                    <td className="px-4 py-3 text-gray-700 hidden md:table-cell max-w-[200px] truncate">
                      {s.tipoCotizacion}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[s.status]}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/solicitudes/${s.id}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ver
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
