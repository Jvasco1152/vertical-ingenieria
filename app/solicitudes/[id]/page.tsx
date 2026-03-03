'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, ExternalLink } from 'lucide-react';

type QuoteStatus = 'PENDING' | 'REVIEWED' | 'CONVERTED' | 'REJECTED';

interface QuoteRequest {
  id: string;
  email: string;
  tipoCliente: string;
  obraEdificio: string;
  direccion: string;
  ciudad: string;
  ciudadOtro: string | null;
  quienSolicita: string | null;
  descripcion: string;
  tipoCotizacion: string;
  tipoCotizacionOtro: string | null;
  nombreContacto: string | null;
  telefonoContacto: string | null;
  requerimientoEspecial: string | null;
  anchoCabina: string | null;
  fondoCabina: string | null;
  tipoCieloFalso: string | null;
  tipoCieloFalsoOtro: string | null;
  fotosCieloFalso: string[];
  status: QuoteStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: 'Pendiente',
  REVIEWED: 'Revisada',
  CONVERTED: 'Convertida a proyecto',
  REJECTED: 'Rechazada',
};

const STATUS_COLORS: Record<QuoteStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  REVIEWED: 'bg-blue-100 text-blue-800',
  CONVERTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

export default function SolicitudDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [solicitud, setSolicitud] = useState<QuoteRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('PENDING');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const res = await fetch(`/api/solicitudes/${id}`);
        if (!res.ok) throw new Error('Solicitud no encontrada');
        const data = await res.json();
        setSolicitud(data.solicitud);
        setSelectedStatus(data.solicitud.status);
        setAdminNotes(data.solicitud.adminNotes || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitud();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/solicitudes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, adminNotes }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const data = await res.json();
      setSolicitud(data.solicitud);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error || 'Solicitud no encontrada'}
      </div>
    );
  }

  const ciudadDisplay =
    solicitud.ciudad === 'Otro' && solicitud.ciudadOtro
      ? `${solicitud.ciudadOtro} (Otro)`
      : solicitud.ciudad;

  return (
    <div className="max-w-3xl">
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitud de Cotización</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Recibida el{' '}
              {new Date(solicitud.createdAt).toLocaleDateString('es-CO', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[solicitud.status]}`}>
            {STATUS_LABELS[solicitud.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Datos de la solicitud */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Información de la solicitud</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" value={solicitud.email} />
            <Field label="Tipo de cliente" value={solicitud.tipoCliente} />
            <Field label="Obra / Edificio" value={solicitud.obraEdificio} />
            <Field label="Dirección" value={solicitud.direccion} />
            <Field label="Ciudad" value={ciudadDisplay} />
            <Field label="Quién solicita" value={solicitud.quienSolicita} />
            <Field
              label="Tipo de cotización"
              value={
                solicitud.tipoCotizacion === 'Otro' && solicitud.tipoCotizacionOtro
                  ? `Otro: ${solicitud.tipoCotizacionOtro}`
                  : solicitud.tipoCotizacion
              }
            />
            <Field label="Nombre de contacto" value={solicitud.nombreContacto} />
            <Field label="Teléfono de contacto" value={solicitud.telefonoContacto} />
          </dl>

          {solicitud.descripcion && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Descripción</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap">{solicitud.descripcion}</dd>
            </div>
          )}

          {solicitud.requerimientoEspecial && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Requerimiento especial</dt>
              <dd className="text-sm text-gray-900 whitespace-pre-wrap">{solicitud.requerimientoEspecial}</dd>
            </div>
          )}
        </div>

        {/* Sección Cielo Falso */}
        {solicitud.tipoCotizacion === 'Cambio de cielo falso' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Detalles — Cambio de Cielo Falso</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ancho de cabina (mm)" value={solicitud.anchoCabina} />
              <Field label="Fondo de cabina (mm)" value={solicitud.fondoCabina} />
              <Field label="Tipo de cielo falso" value={solicitud.tipoCieloFalso} />
              {solicitud.tipoCieloFalso === 'Otro' && (
                <Field label="Especificación del tipo" value={solicitud.tipoCieloFalsoOtro} />
              )}
            </dl>

            {solicitud.fotosCieloFalso && solicitud.fotosCieloFalso.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Fotos del cielo falso actual ({solicitud.fotosCieloFalso.length})
                </dt>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {solicitud.fotosCieloFalso.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity group"
                    >
                      <Image
                        src={url}
                        alt={`Foto cielo falso ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Panel de administración */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Gestión interna</h2>

          <div className="space-y-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de la solicitud
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as QuoteStatus)}
                className="w-full sm:w-64 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Notas internas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas internas
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="Notas visibles solo para el equipo admin..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>

              <Link
                href="/projects/new"
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <ExternalLink size={16} />
                Crear proyecto
              </Link>

              {saveSuccess && (
                <span className="text-sm text-green-600 font-medium">Cambios guardados</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
