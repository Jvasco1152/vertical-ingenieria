'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, ExternalLink } from 'lucide-react';

type QuoteStatus = 'PENDING' | 'REVIEWED' | 'CONVERTED' | 'REJECTED';

interface EspejoRow   { pasamanosTecho: boolean; pisoTecho: boolean }
interface PanelRow    { antes: boolean; aCotizar: boolean }
interface PisoRow     { actual: boolean; aCotizar: boolean }

interface QuoteRequest {
  id: string;
  // Sección 1
  email: string;
  tipoCliente: string;
  tipoClienteOtro: string | null;
  obraEdificio: string;
  direccion: string;
  ciudad: string;
  ciudadOtro: string | null;
  quienSolicita: string | null;
  nombreContacto: string | null;
  telefonoContacto: string | null;
  emailContacto: string | null;
  tipoCotizacion: string;
  tipoCotizacionOtro: string | null;
  requerimientoEspecial: string | null;
  requerimientoEspecialOtro: string | null;
  // Sección 2
  anchoCabina: string | null;
  fondoCabina: string | null;
  altoCabina: string | null;
  tipoPuertaCabina: string | null;
  tipoPuertaCabinaOtro: string | null;
  anchoPuertaCabina: string | null;
  altoPuertaCabina: string | null;
  itemsCotizar: Record<string, string> | null;
  descripcionRestauracion: string | null;
  fotosRestauracion: string[];
  tipoCieloFalso: string | null;
  tipoCieloFalsoOtro: string | null;
  tipoEspejo: Record<string, EspejoRow> | null;
  acabadoPaneles: Record<string, PanelRow> | null;
  tipoPiso: Record<string, PisoRow> | null;
  pisoBaseAdicional: string | null;
  problemasPiso: string[];
  // Sección 3
  descripcionCieloFalso: string | null;
  fotosCieloFalso: string[];
  // Sección 4
  descripcionPisoOpcional: string | null;
  descripcionPiso: string | null;
  fotosPiso: string[];
  // Sección 5
  numPisos: string | null;
  tipoPuertasPiso: string[];
  tipoPuertasPisoOtro: string | null;
  tipoMarco: string | null;
  tipoMarcoOtro: string | null;
  acabadoPuertasLobby: string | null;
  acabadoPuertasLobbyOtro: string | null;
  acabadoPuertasOtrosPisos: string | null;
  acabadoPuertasOtrosOtro: string | null;
  descripcionPuertas: string | null;
  fotosPuertas: string[];
  // Sección 6
  descripcionOtro: string | null;
  descripcionOtroReq: string | null;
  fotosOtro: string[];
  // Admin
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
  PENDING:   'bg-yellow-100 text-yellow-800',
  REVIEWED:  'bg-blue-100 text-blue-800',
  CONVERTED: 'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-800',
};

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</dt>
      <dd className="text-sm text-gray-900 whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

function PhotoGrid({ photos, label }: { photos: string[]; label: string }) {
  if (!photos?.length) return null;
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {label} ({photos.length})
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {photos.map((url, i) => (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity group"
          >
            <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}

function SectionDetail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

// ─── Componentes de tablas ────────────────────────────────────────────────────

function ItemsCotizarTable({ data }: { data: Record<string, string> }) {
  const entries = Object.entries(data).filter(([, v]) => v);
  if (!entries.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200">Ítem</th>
            <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map(([item, estado]) => (
            <tr key={item}>
              <td className="px-3 py-2 text-gray-700">{item}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  estado === 'Nuevo'      ? 'bg-green-100 text-green-800'  :
                  estado === 'Reforma'    ? 'bg-blue-100 text-blue-800'    :
                  estado === 'Se conserva'? 'bg-gray-100 text-gray-700'    :
                  'bg-red-50 text-red-600'
                }`}>{estado}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixTable({
  data,
  cols,
}: {
  data: Record<string, Record<string, boolean>>;
  cols: { key: string; label: string }[];
}) {
  const entries = Object.entries(data).filter(([, row]) => Object.values(row).some(Boolean));
  if (!entries.length) return null;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 mt-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200">Material / Tipo</th>
            {cols.map(c => (
              <th key={c.key} className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map(([item, row]) => (
            <tr key={item}>
              <td className="px-3 py-2 text-gray-700">{item}</td>
              {cols.map(c => (
                <td key={c.key} className="px-3 py-2 text-center text-gray-500">
                  {(row as Record<string, boolean>)[c.key] ? '✓' : '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SolicitudDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [solicitud,     setSolicitud]     = useState<QuoteRequest | null>(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus>('PENDING');
  const [adminNotes,    setAdminNotes]    = useState('');
  const [isSaving,      setIsSaving]      = useState(false);
  const [saveSuccess,   setSaveSuccess]   = useState(false);

  useEffect(() => {
    (async () => {
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
    })();
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

  const tipoClienteDisplay =
    solicitud.tipoCliente === 'Otro' && solicitud.tipoClienteOtro
      ? `Otro: ${solicitud.tipoClienteOtro}`
      : solicitud.tipoCliente;

  const tipoCotizacionDisplay =
    solicitud.tipoCotizacion === 'Otro' && solicitud.tipoCotizacionOtro
      ? `Otro: ${solicitud.tipoCotizacionOtro}`
      : solicitud.tipoCotizacion;

  const tipoCieloDisplay =
    solicitud.tipoCieloFalso === 'Otro' && solicitud.tipoCieloFalsoOtro
      ? `Otro: ${solicitud.tipoCieloFalsoOtro}`
      : solicitud.tipoCieloFalso;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3 transition-colors"
        >
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitud de Cotización</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Recibida el{' '}
              {new Date(solicitud.createdAt).toLocaleDateString('es-CO', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[solicitud.status]}`}>
            {STATUS_LABELS[solicitud.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">

        {/* Sección 1 — Datos generales */}
        <SectionDetail title="Información General">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email solicitante" value={solicitud.email} />
            <Field label="Tipo de cliente"   value={tipoClienteDisplay} />
            <Field label="Quién solicita"    value={solicitud.quienSolicita} />
            <Field label="Obra / Edificio"   value={solicitud.obraEdificio} />
            <Field label="Dirección"         value={solicitud.direccion} />
            <Field label="Ciudad"            value={ciudadDisplay} />
            <Field label="Nombre contacto"   value={solicitud.nombreContacto} />
            <Field label="Teléfono contacto" value={solicitud.telefonoContacto} />
            <Field label="Email contacto"    value={solicitud.emailContacto} />
            <Field label="Tipo de cotización" value={tipoCotizacionDisplay} />
          </dl>
          {solicitud.requerimientoEspecial && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Requerimiento especial
              </dt>
              <dd className="text-sm text-gray-900">
                {solicitud.requerimientoEspecial}
                {solicitud.requerimientoEspecialOtro && (
                  <span className="text-gray-500"> — {solicitud.requerimientoEspecialOtro}</span>
                )}
              </dd>
            </div>
          )}
        </SectionDetail>

        {/* Sección 2 — Restauración completa */}
        {solicitud.tipoCotizacion === 'Restauración completa y/o parcial de cabina' && (
          <SectionDetail title="Restauración Completa de Cabina">
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Ancho cabina (mm)" value={solicitud.anchoCabina} />
              <Field label="Fondo cabina (mm)" value={solicitud.fondoCabina} />
              <Field label="Alto cabina (mm)"  value={solicitud.altoCabina} />
              <Field label="Tipo puerta cabina" value={
                solicitud.tipoPuertaCabina === 'Otro' && solicitud.tipoPuertaCabinaOtro
                  ? `Otro: ${solicitud.tipoPuertaCabinaOtro}`
                  : solicitud.tipoPuertaCabina
              } />
              <Field label="Ancho apertura puerta (mm)" value={solicitud.anchoPuertaCabina} />
              <Field label="Alto apertura puerta (mm)"  value={solicitud.altoPuertaCabina} />
            </dl>

            {solicitud.itemsCotizar && Object.keys(solicitud.itemsCotizar).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Ítems a cotizar</p>
                <ItemsCotizarTable data={solicitud.itemsCotizar} />
              </div>
            )}

            {solicitud.descripcionRestauracion && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Field label="Descripción del requerimiento" value={solicitud.descripcionRestauracion} />
              </div>
            )}

            <PhotoGrid photos={solicitud.fotosRestauracion} label="Fotos actuales de cabina" />

            {solicitud.tipoCieloFalso && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Field label="Tipo de cielo falso" value={tipoCieloDisplay} />
              </div>
            )}

            {solicitud.tipoEspejo && Object.keys(solicitud.tipoEspejo).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo de espejo</p>
                <MatrixTable
                  data={solicitud.tipoEspejo as unknown as Record<string, Record<string, boolean>>}
                  cols={[{ key: 'pasamanosTecho', label: 'Pasamanos techo' }, { key: 'pisoTecho', label: 'Piso techo' }]}
                />
              </div>
            )}

            {solicitud.acabadoPaneles && Object.keys(solicitud.acabadoPaneles).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Acabado de paneles</p>
                <MatrixTable
                  data={solicitud.acabadoPaneles as unknown as Record<string, Record<string, boolean>>}
                  cols={[{ key: 'antes', label: 'Antes' }, { key: 'aCotizar', label: 'A cotizar' }]}
                />
              </div>
            )}

            {solicitud.tipoPiso && Object.keys(solicitud.tipoPiso).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo de piso</p>
                <MatrixTable
                  data={solicitud.tipoPiso as unknown as Record<string, Record<string, boolean>>}
                  cols={[{ key: 'actual', label: 'Actual' }, { key: 'aCotizar', label: 'A cotizar' }]}
                />
              </div>
            )}

            {(solicitud.pisoBaseAdicional || solicitud.problemasPiso?.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Base adicional en piso" value={solicitud.pisoBaseAdicional} />
                {solicitud.problemasPiso?.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Problemas detectados</dt>
                    <dd className="text-sm text-gray-900">{solicitud.problemasPiso.join(', ')}</dd>
                  </div>
                )}
              </div>
            )}
          </SectionDetail>
        )}

        {/* Sección 3 — Cielo falso */}
        {solicitud.tipoCotizacion === 'Solo mejora en iluminación o cambio de cielo falso' && (
          <SectionDetail title="Cambio de Cielo Falso">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ancho cabina (mm)" value={solicitud.anchoCabina} />
              <Field label="Fondo cabina (mm)" value={solicitud.fondoCabina} />
              <Field label="Tipo de cielo falso" value={tipoCieloDisplay} />
            </dl>
            {solicitud.descripcionCieloFalso && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Field label="Descripción del requerimiento" value={solicitud.descripcionCieloFalso} />
              </div>
            )}
            <PhotoGrid photos={solicitud.fotosCieloFalso} label="Fotos del cielo falso actual" />
          </SectionDetail>
        )}

        {/* Sección 4 — Cambio de piso */}
        {solicitud.tipoCotizacion === 'Solo cambio de piso o restauración de plataforma' && (
          <SectionDetail title="Cambio de Piso">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Ancho cabina (mm)" value={solicitud.anchoCabina} />
              <Field label="Fondo cabina (mm)" value={solicitud.fondoCabina} />
              <Field label="Base adicional en piso" value={solicitud.pisoBaseAdicional} />
            </dl>

            {solicitud.descripcionPisoOpcional && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Field label="Descripción adicional" value={solicitud.descripcionPisoOpcional} />
              </div>
            )}

            {solicitud.tipoPiso && Object.keys(solicitud.tipoPiso).length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tipo de piso</p>
                <MatrixTable
                  data={solicitud.tipoPiso as unknown as Record<string, Record<string, boolean>>}
                  cols={[{ key: 'actual', label: 'Actual' }, { key: 'aCotizar', label: 'A cotizar' }]}
                />
              </div>
            )}

            {solicitud.problemasPiso?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Problemas detectados</dt>
                <dd className="text-sm text-gray-900">{solicitud.problemasPiso.join(', ')}</dd>
              </div>
            )}

            {solicitud.descripcionPiso && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Field label="Descripción del requerimiento" value={solicitud.descripcionPiso} />
              </div>
            )}

            <PhotoGrid photos={solicitud.fotosPiso} label="Fotos del piso actual" />
          </SectionDetail>
        )}

        {/* Sección 5 — Puertas de piso */}
        {solicitud.tipoCotizacion === 'Pintura de puertas de piso' && (
          <SectionDetail title="Restauración de Puertas de Piso">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Número de pisos" value={solicitud.numPisos} />
              <Field label="Tipo de marco" value={
                solicitud.tipoMarco === 'Otro' && solicitud.tipoMarcoOtro
                  ? `Otro: ${solicitud.tipoMarcoOtro}`
                  : solicitud.tipoMarco
              } />
              <Field label="Acabado puertas lobby" value={
                solicitud.acabadoPuertasLobby === 'Otro' && solicitud.acabadoPuertasLobbyOtro
                  ? `Otro: ${solicitud.acabadoPuertasLobbyOtro}`
                  : solicitud.acabadoPuertasLobby
              } />
              <Field label="Acabado puertas otros pisos" value={
                solicitud.acabadoPuertasOtrosPisos === 'Otro' && solicitud.acabadoPuertasOtrosOtro
                  ? `Otro: ${solicitud.acabadoPuertasOtrosOtro}`
                  : solicitud.acabadoPuertasOtrosPisos
              } />
            </dl>

            {solicitud.tipoPuertasPiso?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Tipo de puertas</dt>
                <dd className="text-sm text-gray-900">
                  {solicitud.tipoPuertasPiso.join(', ')}
                  {solicitud.tipoPuertasPisoOtro && ` — ${solicitud.tipoPuertasPisoOtro}`}
                </dd>
              </div>
            )}

            {solicitud.descripcionPuertas && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Field label="Descripción del requerimiento" value={solicitud.descripcionPuertas} />
              </div>
            )}

            <PhotoGrid photos={solicitud.fotosPuertas} label="Fotos de las puertas actuales" />
          </SectionDetail>
        )}

        {/* Sección 6 — Requerimiento especial / Otros */}
        {solicitud.tipoCotizacion === 'Otro' && (
          <SectionDetail title="Requerimiento Especial / Otros">
            <dl className="grid grid-cols-1 gap-4">
              <Field label="Descripción adicional"     value={solicitud.descripcionOtro} />
              <Field label="Descripción del requerimiento" value={solicitud.descripcionOtroReq} />
            </dl>
            <PhotoGrid photos={solicitud.fotosOtro} label="Fotos adjuntas" />
          </SectionDetail>
        )}

        {/* Panel de administración */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Gestión interna</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado de la solicitud</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as QuoteStatus)}
                className="w-full sm:w-64 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                {(Object.keys(STATUS_LABELS) as QuoteStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="Notas visibles solo para el equipo admin..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>
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
              {saveSuccess && <span className="text-sm text-green-600 font-medium">Cambios guardados</span>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
