'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

// ─── Constantes ──────────────────────────────────────────────────────────────

const TIPOS_CLIENTE = [
  'AIV', 'Altus', 'Ascensores Schindler', 'Conekta', 'Eleven',
  'Estilo Ingeniería', 'Mitsubishi', 'Soluciones Verticales', 'Otis', 'Tecnivec',
] as const;

const CIUDADES = [
  'Medellín', 'Sabaneta', 'Itagui', 'Envigado', 'Bello',
  'Rionegro', 'Copacabana', 'Girardota',
] as const;

const TIPOS_COTIZACION = [
  'Restauración completa y/o parcial de cabina',
  'Solo mejora en iluminación o cambio de cielo falso',
  'Solo cambio de piso o restauración de plataforma',
  'Pintura de puertas de piso',
  'Otro',
] as const;

const REQUERIMIENTOS_ESPECIALES = [
  'Se debe informar con antelación para realizar la visita.',
  'Para la visita se debe tener acompañamiento de la empresa de mantenimiento.',
  'Se debe realizar un entrenamiento antes de ingresar a las instalaciones.',
  'Personal debe estar certificado en espacios confinados.',
  'Se debe tener una SISO tiempo completo.',
  'Ninguno',
] as const;

const TIPOS_CIELO_FALSO = [
  { id: 'Tipo A', letra: 'A', descripcion: 'Cielo falso en acero inoxidable con iluminación led dirigible' },
  { id: 'Tipo B', letra: 'B', descripcion: 'Cielo falso en acero inoxidable con iluminación led dirigible en arco' },
  { id: 'Tipo C', letra: 'C', descripcion: 'Cielo falso en acero inoxidable con iluminación led recesada' },
  { id: 'Tipo D', letra: 'D', descripcion: 'Cielo falso en combinación de acero inoxidable y lámina pintada negro, con iluminación led dirigible' },
  { id: 'Tipo E', letra: 'E', descripcion: 'Cielo falso en acero inoxidable con iluminación led dirigible en paneles horizontales' },
] as const;

const ITEMS_COTIZAR = [
  'Cielo falso', 'Enchape paneles', 'Iluminación indirecta en paneles',
  'Frente de cabina con o sin adecuación de botonera', 'Enchape de puertas de cabina',
  'Espejo', 'Pasamanos', 'Fijacarpas', 'Guardas', 'Zocalos',
  'Piso', 'Lona de protección', 'Otro',
] as const;

const ESTADOS_ITEM = ['Nuevo', 'Reforma', 'Se conserva', 'N/A'] as const;

const TIPOS_ESPEJO = [
  '4 mm con pelicula posterior',
  '3+3 (6 mm) de seguridad',
  'Bisel delgado arriba y abajo',
  'Marco en acero inoxidable',
] as const;

const MATERIALES_PANEL = ['Melamina', 'HPL (Formica)', 'Acero Inoxidable', 'Pintura', 'Otro'] as const;

const TIPOS_PISO = [
  'Emeflex', 'PVC (Baldosa)', 'Vinilo (Rollo)', 'Granito natural o Quartztone',
  'Piedra sinterizada', 'Porcelanato', 'Alfajor acero o aluminio',
  'Otros (Ceramicas, marmol, etc...)', 'No tiene',
] as const;

const PROBLEMAS_PISO = [
  'Plataforma oxidada o perforada', 'Piso ondulado',
  'Piso embombado', 'Piso muy desgastado, quebrado o reventado',
] as const;

const TIPOS_PUERTA = ['Apertura central', 'Apertura lateral', 'Batiente', 'Guillotina'] as const;
const TIPOS_PUERTA_PISO = ['Apertura central', 'Apertura lateral', 'Guillotina', 'Batiente'] as const;
const TIPOS_MARCO = ['Anchos', 'Delgados'] as const;
const ACABADOS_PUERTA = ['Acero Inoxidable', 'Pintura'] as const;

// ─── Tipos ───────────────────────────────────────────────────────────────────

type EspejoRow = { pasamanosTecho: boolean; pisoTecho: boolean };
type PanelRow  = { antes: boolean; aCotizar: boolean };
type PisoRow   = { actual: boolean; aCotizar: boolean };

// ─── Helpers de UI ───────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function InputClass(hasError?: boolean) {
  return `w-full px-3 py-2.5 border ${hasError ? 'border-red-400' : 'border-gray-300'} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white`;
}

function Err({ msg }: { msg?: unknown }) {
  if (!msg || typeof msg !== 'string') return null;
  return <p className="mt-1 text-xs text-red-500">{msg}</p>;
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-base font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-blue-100 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function RadioGroup({ options, value, onChange, name }: {
  options: readonly string[]; value: string; onChange: (v: string) => void; name: string;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-blue-600 mt-0.5 shrink-0"
          />
          <span className="text-sm text-gray-700">{opt}</span>
        </label>
      ))}
    </div>
  );
}

function PhotoUploader({
  photos, onUpload, onRemove, uploading, error, max = 5,
}: {
  photos: string[];
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (i: number) => void;
  uploading: boolean;
  error: string | null;
  max?: number;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-2">
        Máximo {max} fotos · JPG, PNG, WEBP · Máx. 10 MB por foto
      </p>
      {photos.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-2">
          {photos.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              <Image src={url} alt={`Foto ${i + 1}`} fill className="object-cover" />
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
      {photos.length < max && (
        <label className={`flex items-center gap-2 w-full border-2 border-dashed rounded-lg px-4 py-3 text-sm transition cursor-pointer ${
          uploading
            ? 'border-blue-300 bg-blue-50 text-blue-400 cursor-wait'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600'
        }`}>
          {uploading
            ? <><Loader2 size={15} className="animate-spin" /> Subiendo...</>
            : <><Upload size={15} /> {photos.length === 0 ? 'Seleccionar fotos' : `Agregar más (${photos.length}/${max})`}</>}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={uploading}
            onChange={onUpload}
            className="hidden"
          />
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function CieloFalsoSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {TIPOS_CIELO_FALSO.map((tipo) => {
        const selected = value === tipo.id;
        return (
          <button
            key={tipo.id}
            type="button"
            onClick={() => onChange(tipo.id)}
            className={`rounded-xl border-2 text-left transition-all focus:outline-none overflow-hidden ${
              selected ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="h-24 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
              <span className="text-5xl font-black text-slate-300">{tipo.letra}</span>
              {selected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-xs font-bold text-gray-800">{tipo.id}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight line-clamp-2">{tipo.descripcion}</p>
            </div>
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onChange('Otro')}
        className={`rounded-xl border-2 text-left transition-all focus:outline-none overflow-hidden ${
          value === 'Otro' ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="h-24 bg-gray-50 flex items-center justify-center relative">
          <span className="text-5xl font-black text-gray-200">?</span>
          {value === 'Otro' && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-2.5">
          <p className="text-xs font-bold text-gray-800">Otro</p>
          <p className="text-xs text-gray-500">Especificar a continuación</p>
        </div>
      </button>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SolicitudPage() {
  // react-hook-form para campos de Sección 1
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const tipoCotizacion = watch('tipoCotizacion');
  const ciudadValue    = watch('ciudad');
  const tipoClienteVal = watch('tipoCliente');

  // Estado para checkboxes de requerimiento especial
  const [reqEspecial, setReqEspecial] = useState<string[]>([]);

  // Estado general para campos de texto de secciones 2-6
  const [f, setF] = useState<Record<string, string>>({});
  const sf = (name: string, val: string) => setF(p => ({ ...p, [name]: val }));

  // Tablas (Sección 2)
  const [itemsCotizar,   setItemsCotizar]   = useState<Record<string, string>>({});
  const [tipoEspejo,     setTipoEspejo]     = useState<Record<string, EspejoRow>>({});
  const [acabadoPaneles, setAcabadoPaneles] = useState<Record<string, PanelRow>>({});
  const [tipoPiso,       setTipoPiso]       = useState<Record<string, PisoRow>>({});
  const [problemasPiso,  setProblemasPiso]  = useState<string[]>([]);

  // Checkboxes (Sección 5)
  const [tipoPuertasPiso, setTipoPuertasPiso] = useState<string[]>([]);

  // Fotos por sección
  const [fotosRestauracion, setFotosRestauracion] = useState<string[]>([]);
  const [fotosCieloFalso,   setFotosCieloFalso]   = useState<string[]>([]);
  const [fotosPiso,         setFotosPiso]         = useState<string[]>([]);
  const [fotosPuertas,      setFotosPuertas]      = useState<string[]>([]);
  const [fotosOtro,         setFotosOtro]         = useState<string[]>([]);

  // UI
  const [submitted,    setSubmitted]    = useState(false);
  const [isLoading,    setIsLoading]    = useState(false);
  const [serverError,  setServerError]  = useState<string | null>(null);
  const [uploadingSec, setUploadingSec] = useState<string | null>(null);
  const [photoError,   setPhotoError]   = useState<string | null>(null);

  // ─── Upload de fotos ───────────────────────────────────────────────────────

  const makeUploadHandler = (
    section: string,
    photos: string[],
    setPhotos: (p: string[]) => void,
    max = 5,
  ) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setPhotoError(null);

    const remaining = max - photos.length;
    if (remaining <= 0) { setPhotoError(`Límite de ${max} fotos alcanzado`); return; }

    const toUpload = files.slice(0, remaining);
    setUploadingSec(section);
    const newPhotos = [...photos];

    for (const file of toUpload) {
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError(`"${file.name}" supera los 10 MB`);
        continue;
      }
      try {
        const signRes = await fetch('/api/cloudinary/sign-public', { method: 'POST' });
        if (!signRes.ok) throw new Error();
        const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

        const fd = new FormData();
        fd.append('file', file);
        fd.append('signature', signature);
        fd.append('timestamp', String(timestamp));
        fd.append('folder', folder);
        fd.append('api_key', apiKey);

        const up = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST', body: fd,
        });
        if (!up.ok) throw new Error();
        const data = await up.json();
        newPhotos.push(data.secure_url);
      } catch {
        setPhotoError('Error al subir una foto. Intenta de nuevo.');
      }
    }
    setPhotos(newPhotos);
    setUploadingSec(null);
    e.target.value = '';
  };

  // ─── Toggle helpers ────────────────────────────────────────────────────────

  const toggleCheck = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const toggleEspejo = (tipo: string, col: keyof EspejoRow) => {
    setTipoEspejo(p => ({
      ...p,
      [tipo]: { ...(p[tipo] ?? { pasamanosTecho: false, pisoTecho: false }), [col]: !(p[tipo]?.[col] ?? false) },
    }));
  };

  const togglePanel = (mat: string, col: keyof PanelRow) => {
    setAcabadoPaneles(p => ({
      ...p,
      [mat]: { ...(p[mat] ?? { antes: false, aCotizar: false }), [col]: !(p[mat]?.[col] ?? false) },
    }));
  };

  const togglePiso = (mat: string, col: keyof PisoRow) => {
    setTipoPiso(p => ({
      ...p,
      [mat]: { ...(p[mat] ?? { actual: false, aCotizar: false }), [col]: !(p[mat]?.[col] ?? false) },
    }));
  };

  // ─── Submit ────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setServerError(null);

    const payload = {
      // Sección 1
      ...data,
      requerimientoEspecial: reqEspecial.join(', '),
      // Campos de texto de secciones 2-6
      anchoCabina:              f.anchoCabina    || undefined,
      fondoCabina:              f.fondoCabina    || undefined,
      altoCabina:               f.altoCabina     || undefined,
      tipoPuertaCabina:         f.tipoPuertaCabina || undefined,
      tipoPuertaCabinaOtro:     f.tipoPuertaCabinaOtro || undefined,
      anchoPuertaCabina:        f.anchoPuertaCabina || undefined,
      altoPuertaCabina:         f.altoPuertaCabina  || undefined,
      descripcionRestauracion:  f.descripcionRestauracion || undefined,
      tipoCieloFalso:           f.tipoCieloFalso || undefined,
      tipoCieloFalsoOtro:       f.tipoCieloFalsoOtro || undefined,
      pisoBaseAdicional:        f.pisoBaseAdicional || undefined,
      descripcionCieloFalso:    f.descripcionCieloFalso || undefined,
      descripcionPisoOpcional:  f.descripcionPisoOpcional || undefined,
      descripcionPiso:          f.descripcionPiso || undefined,
      numPisos:                 f.numPisos || undefined,
      tipoPuertasPisoOtro:      f.tipoPuertasPisoOtro || undefined,
      tipoMarco:                f.tipoMarco || undefined,
      tipoMarcoOtro:            f.tipoMarcoOtro || undefined,
      acabadoPuertasLobby:      f.acabadoPuertasLobby || undefined,
      acabadoPuertasLobbyOtro:  f.acabadoPuertasLobbyOtro || undefined,
      acabadoPuertasOtrosPisos: f.acabadoPuertasOtrosPisos || undefined,
      acabadoPuertasOtrosOtro:  f.acabadoPuertasOtrosOtro || undefined,
      descripcionPuertas:       f.descripcionPuertas || undefined,
      descripcionOtro:          f.descripcionOtro || undefined,
      descripcionOtroReq:       f.descripcionOtroReq || undefined,
      // Tablas
      itemsCotizar:   Object.keys(itemsCotizar).length   ? itemsCotizar   : undefined,
      tipoEspejo:     Object.keys(tipoEspejo).length     ? tipoEspejo     : undefined,
      acabadoPaneles: Object.keys(acabadoPaneles).length ? acabadoPaneles : undefined,
      tipoPiso:       Object.keys(tipoPiso).length       ? tipoPiso       : undefined,
      // Arrays
      problemasPiso:  problemasPiso.length  ? problemasPiso  : undefined,
      tipoPuertasPiso: tipoPuertasPiso.length ? tipoPuertasPiso : undefined,
      // Fotos
      fotosRestauracion,
      fotosCieloFalso,
      fotosPiso,
      fotosPuertas,
      fotosOtro,
    };

    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Error al enviar');
      }
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Pantalla de éxito ─────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud. Nuestro equipo la revisará y se pondrá en contacto contigo pronto.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium underline"
          >
            Enviar otra solicitud
          </button>
        </div>
      </div>
    );
  }

  const isUploading = uploadingSec !== null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Solicitud de Cotización</h1>
          <p className="text-blue-100 text-sm">
            Vertical Ingeniería — Diseño y modernización de ascensores
          </p>
          <p className="text-blue-200 text-xs mt-2 max-w-lg mx-auto">
            Diligencia los datos lo más completo y preciso posible. Una vez recibida la información,
            nuestro equipo revisará la solicitud y enviará la cotización en el menor tiempo posible.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── SECCIÓN 1: Datos generales ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 space-y-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Información General</h2>
              <p className="text-xs text-gray-500 mt-0.5">Campos marcados con * son obligatorios</p>
            </div>

            {/* Email */}
            <div>
              <Label required>Correo electrónico</Label>
              <input
                type="email"
                {...register('email', { required: 'El correo es requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })}
                placeholder="correo@ejemplo.com"
                className={InputClass(!!errors.email)}
              />
              <Err msg={errors.email?.message} />
            </div>

            {/* Tipo de cliente */}
            <div>
              <Label required>Tipo de cliente</Label>
              <select
                {...register('tipoCliente', { required: 'Seleccione el tipo de cliente' })}
                className={InputClass(!!errors.tipoCliente)}
              >
                <option value="">Seleccionar...</option>
                {TIPOS_CLIENTE.map(t => <option key={t} value={t}>{t}</option>)}
                <option value="Otro">Otro</option>
              </select>
              <Err msg={errors.tipoCliente?.message} />
              {tipoClienteVal === 'Otro' && (
                <input
                  type="text"
                  {...register('tipoClienteOtro')}
                  placeholder="Especifique el tipo de cliente"
                  className={`${InputClass()} mt-2`}
                />
              )}
            </div>

            {/* Quien solicita */}
            <div>
              <Label required>¿Quién solicita?</Label>
              <input
                type="text"
                {...register('quienSolicita', { required: 'Este campo es requerido' })}
                placeholder="Nombre de la persona o empresa que solicita"
                className={InputClass(!!errors.quienSolicita)}
              />
              <Err msg={errors.quienSolicita?.message} />
            </div>

            {/* Obra / Edificio */}
            <div>
              <Label required>Obra / Edificio</Label>
              <input
                type="text"
                {...register('obraEdificio', { required: 'Este campo es requerido' })}
                placeholder="Nombre del edificio o proyecto"
                className={InputClass(!!errors.obraEdificio)}
              />
              <Err msg={errors.obraEdificio?.message} />
            </div>

            {/* Dirección */}
            <div>
              <Label required>Dirección</Label>
              <input
                type="text"
                {...register('direccion', { required: 'La dirección es requerida' })}
                placeholder="Dirección del edificio"
                className={InputClass(!!errors.direccion)}
              />
              <Err msg={errors.direccion?.message} />
            </div>

            {/* Ciudad */}
            <div>
              <Label required>Ciudad</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-1">
                {CIUDADES.map(c => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value={c} {...register('ciudad', { required: 'Seleccione la ciudad' })} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">{c}</span>
                  </label>
                ))}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="Otro" {...register('ciudad')} className="accent-blue-600" />
                  <span className="text-sm text-gray-700">Otro</span>
                </label>
              </div>
              <Err msg={errors.ciudad?.message} />
              {ciudadValue === 'Otro' && (
                <input
                  type="text"
                  {...register('ciudadOtro')}
                  placeholder="Especifique la ciudad"
                  className={`${InputClass()} mt-2`}
                />
              )}
            </div>

            {/* Datos del administrador / persona de contacto */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Administrador / Persona de contacto
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <input type="text" {...register('nombreContacto')} placeholder="Nombre completo" className={InputClass()} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <input type="tel" {...register('telefonoContacto')} placeholder="300 000 0000" className={InputClass()} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Email</Label>
                  <input type="email" {...register('emailContacto')} placeholder="admin@edificio.com" className={InputClass()} />
                </div>
              </div>
            </div>

            {/* Tipo de cotización */}
            <div>
              <Label required>Tipo de cotización</Label>
              <div className="space-y-2">
                {TIPOS_COTIZACION.map(tipo => (
                  <label key={tipo} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      value={tipo}
                      {...register('tipoCotizacion', { required: 'Seleccione el tipo de cotización' })}
                      className="accent-blue-600 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">{tipo}</span>
                  </label>
                ))}
              </div>
              <Err msg={errors.tipoCotizacion?.message} />
              {tipoCotizacion === 'Otro' && (
                <input
                  type="text"
                  {...register('tipoCotizacionOtro')}
                  placeholder="Especifique el tipo de cotización..."
                  className={`${InputClass()} mt-2`}
                />
              )}
            </div>

            {/* Requerimiento especial */}
            <div>
              <Label required>¿Algún requerimiento especial?</Label>
              <div className="space-y-2">
                {REQUERIMIENTOS_ESPECIALES.map(req => (
                  <label key={req} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reqEspecial.includes(req)}
                      onChange={() => toggleCheck(reqEspecial, setReqEspecial, req)}
                      className="accent-blue-600 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">{req}</span>
                  </label>
                ))}
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reqEspecial.includes('Otro')}
                    onChange={() => toggleCheck(reqEspecial, setReqEspecial, 'Otro')}
                    className="accent-blue-600 mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-gray-700">Otro</span>
                </label>
              </div>
              {reqEspecial.includes('Otro') && (
                <input
                  type="text"
                  {...register('requerimientoEspecialOtro')}
                  placeholder="Especifique el requerimiento..."
                  className={`${InputClass()} mt-2`}
                />
              )}
            </div>
          </div>

          {/* ── SECCIÓN 2: Restauración completa ──────────────────────────── */}
          {tipoCotizacion === 'Restauración completa y/o parcial de cabina' && (
            <SectionCard
              title="Restauración completa y/o parcial de cabina"
              subtitle="Ingrese la información general de cabina que tenga disponible"
            >
              {/* Medidas de cabina */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'anchoCabina', label: 'Ancho (mm)' },
                  { name: 'fondoCabina', label: 'Fondo (mm)' },
                  { name: 'altoCabina',  label: 'Alto (mm)' },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <Label>{label}</Label>
                    <input
                      type="text"
                      value={f[name] || ''}
                      onChange={e => sf(name, e.target.value)}
                      placeholder="Ej: 1000"
                      className={InputClass()}
                    />
                  </div>
                ))}
              </div>

              {/* Tipo de puerta de cabina */}
              <div>
                <Label>Tipo de puerta de cabina</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIPOS_PUERTA.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="tipoPuertaCabina"
                        value={t}
                        checked={f.tipoPuertaCabina === t}
                        onChange={() => sf('tipoPuertaCabina', t)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="tipoPuertaCabina"
                      value="Otro"
                      checked={f.tipoPuertaCabina === 'Otro'}
                      onChange={() => sf('tipoPuertaCabina', 'Otro')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Otro</span>
                  </label>
                </div>
                {f.tipoPuertaCabina === 'Otro' && (
                  <input
                    type="text"
                    value={f.tipoPuertaCabinaOtro || ''}
                    onChange={e => sf('tipoPuertaCabinaOtro', e.target.value)}
                    placeholder="Especifique el tipo de puerta"
                    className={`${InputClass()} mt-2`}
                  />
                )}
              </div>

              {/* Apertura de puerta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ancho apertura puerta (mm)</Label>
                  <input type="text" value={f.anchoPuertaCabina || ''} onChange={e => sf('anchoPuertaCabina', e.target.value)} placeholder="Ej: 800" className={InputClass()} />
                </div>
                <div>
                  <Label>Alto apertura puerta (mm)</Label>
                  <input type="text" value={f.altoPuertaCabina || ''} onChange={e => sf('altoPuertaCabina', e.target.value)} placeholder="Ej: 2100" className={InputClass()} />
                </div>
              </div>

              {/* Tabla ITEM A COTIZAR */}
              <div>
                <Label required>Ítems a cotizar</Label>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200 min-w-[180px]">Ítem</th>
                        {ESTADOS_ITEM.map(e => (
                          <th key={e} className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center whitespace-nowrap">{e}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ITEMS_COTIZAR.map(item => (
                        <tr key={item} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{item}</td>
                          {ESTADOS_ITEM.map(estado => (
                            <td key={estado} className="px-3 py-2 text-center">
                              <input
                                type="radio"
                                name={`item-${item}`}
                                checked={itemsCotizar[item] === estado}
                                onChange={() => setItemsCotizar(p => ({ ...p, [item]: estado }))}
                                className="accent-blue-600"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Descripción del requerimiento */}
              <div>
                <Label required>Descripción del requerimiento</Label>
                <textarea
                  value={f.descripcionRestauracion || ''}
                  onChange={e => sf('descripcionRestauracion', e.target.value)}
                  rows={4}
                  placeholder="Describa detalladamente lo que necesita..."
                  className={`${InputClass()} resize-none`}
                />
              </div>

              {/* Fotos de cabina */}
              <div>
                <Label>Fotos actuales de cabina</Label>
                <PhotoUploader
                  photos={fotosRestauracion}
                  onUpload={makeUploadHandler('restauracion', fotosRestauracion, setFotosRestauracion)}
                  onRemove={i => setFotosRestauracion(p => p.filter((_, idx) => idx !== i))}
                  uploading={uploadingSec === 'restauracion'}
                  error={uploadingSec === 'restauracion' ? null : null}
                />
              </div>

              {/* Tipo de cielo falso */}
              <div>
                <Label>Tipo de cielo falso a cotizar</Label>
                <CieloFalsoSelector value={f.tipoCieloFalso || ''} onChange={v => sf('tipoCieloFalso', v)} />
                {f.tipoCieloFalso === 'Otro' && (
                  <input
                    type="text"
                    value={f.tipoCieloFalsoOtro || ''}
                    onChange={e => sf('tipoCieloFalsoOtro', e.target.value)}
                    placeholder="Describa el tipo de cielo falso..."
                    className={`${InputClass()} mt-3`}
                  />
                )}
              </div>

              {/* Tabla Tipo de espejo */}
              <div>
                <Label>Tipo de espejo a cotizar</Label>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200 min-w-[200px]">Tipo</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">Espejo pasamanos techo</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">Espejo piso techo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {TIPOS_ESPEJO.map(tipo => (
                        <tr key={tipo} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{tipo}</td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={tipoEspejo[tipo]?.pasamanosTecho ?? false}
                              onChange={() => toggleEspejo(tipo, 'pasamanosTecho')}
                              className="accent-blue-600"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={tipoEspejo[tipo]?.pisoTecho ?? false}
                              onChange={() => toggleEspejo(tipo, 'pisoTecho')}
                              className="accent-blue-600"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla Acabado de paneles */}
              <div>
                <Label>Tipo de acabado de paneles</Label>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200 min-w-[160px]">Material</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">Antes</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">A cotizar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {MATERIALES_PANEL.map(mat => (
                        <tr key={mat} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{mat}</td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={acabadoPaneles[mat]?.antes ?? false} onChange={() => togglePanel(mat, 'antes')} className="accent-blue-600" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={acabadoPaneles[mat]?.aCotizar ?? false} onChange={() => togglePanel(mat, 'aCotizar')} className="accent-blue-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabla Tipo de piso */}
              <div>
                <Label>Tipo de piso</Label>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200 min-w-[200px]">Material</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">Actual</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">A cotizar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {TIPOS_PISO.map(mat => (
                        <tr key={mat} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{mat}</td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={tipoPiso[mat]?.actual ?? false} onChange={() => togglePiso(mat, 'actual')} className="accent-blue-600" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={tipoPiso[mat]?.aCotizar ?? false} onChange={() => togglePiso(mat, 'aCotizar')} className="accent-blue-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Piso base adicional */}
              <div>
                <Label>¿El piso actual tiene base adicional? (madera, mortero, otro)</Label>
                <RadioGroup
                  name="pisoBaseAdicional"
                  options={['Sí', 'No', 'No sé']}
                  value={f.pisoBaseAdicional || ''}
                  onChange={v => sf('pisoBaseAdicional', v)}
                />
              </div>

              {/* Problemas de piso */}
              <div>
                <Label>¿Se han detectado problemas en el piso o plataforma?</Label>
                <div className="space-y-2">
                  {PROBLEMAS_PISO.map(p => (
                    <label key={p} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={problemasPiso.includes(p)}
                        onChange={() => toggleCheck(problemasPiso, setProblemasPiso, p)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{p}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={problemasPiso.includes('Otro')}
                      onChange={() => toggleCheck(problemasPiso, setProblemasPiso, 'Otro')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Otro</span>
                  </label>
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── SECCIÓN 3: Cambio de cielo falso ─────────────────────────── */}
          {tipoCotizacion === 'Solo mejora en iluminación o cambio de cielo falso' && (
            <SectionCard
              title="Cambio de Cielo Falso"
              subtitle="Anexa la información disponible y describe el requerimiento"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ancho de cabina (mm)</Label>
                  <input type="text" value={f.anchoCabina || ''} onChange={e => sf('anchoCabina', e.target.value)} placeholder="Ej: 1000" className={InputClass()} />
                </div>
                <div>
                  <Label>Fondo de cabina (mm)</Label>
                  <input type="text" value={f.fondoCabina || ''} onChange={e => sf('fondoCabina', e.target.value)} placeholder="Ej: 1300" className={InputClass()} />
                </div>
              </div>

              <div>
                <Label required>Descripción del requerimiento</Label>
                <textarea
                  value={f.descripcionCieloFalso || ''}
                  onChange={e => sf('descripcionCieloFalso', e.target.value)}
                  rows={4}
                  placeholder="Describa qué necesita cotizar..."
                  className={`${InputClass()} resize-none`}
                />
              </div>

              <div>
                <Label>Tipo de cielo falso a cotizar</Label>
                <CieloFalsoSelector value={f.tipoCieloFalso || ''} onChange={v => sf('tipoCieloFalso', v)} />
                {f.tipoCieloFalso === 'Otro' && (
                  <input
                    type="text"
                    value={f.tipoCieloFalsoOtro || ''}
                    onChange={e => sf('tipoCieloFalsoOtro', e.target.value)}
                    placeholder="Describa el tipo de cielo falso..."
                    className={`${InputClass()} mt-3`}
                  />
                )}
              </div>

              <div>
                <Label>Fotos del cielo falso actual</Label>
                <PhotoUploader
                  photos={fotosCieloFalso}
                  onUpload={makeUploadHandler('cieloFalso', fotosCieloFalso, setFotosCieloFalso)}
                  onRemove={i => setFotosCieloFalso(p => p.filter((_, idx) => idx !== i))}
                  uploading={uploadingSec === 'cieloFalso'}
                  error={photoError}
                />
              </div>
            </SectionCard>
          )}

          {/* ── SECCIÓN 4: Cambio de piso ─────────────────────────────────── */}
          {tipoCotizacion === 'Solo cambio de piso o restauración de plataforma' && (
            <SectionCard title="Cambio de Piso">
              <div>
                <Label>Descripción (opcional)</Label>
                <textarea
                  value={f.descripcionPisoOpcional || ''}
                  onChange={e => sf('descripcionPisoOpcional', e.target.value)}
                  rows={3}
                  placeholder="Información adicional..."
                  className={`${InputClass()} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ancho de cabina (mm)</Label>
                  <input type="text" value={f.anchoCabina || ''} onChange={e => sf('anchoCabina', e.target.value)} placeholder="Ej: 1000" className={InputClass()} />
                </div>
                <div>
                  <Label>Fondo de cabina (mm)</Label>
                  <input type="text" value={f.fondoCabina || ''} onChange={e => sf('fondoCabina', e.target.value)} placeholder="Ej: 1300" className={InputClass()} />
                </div>
              </div>

              {/* Tabla de piso */}
              <div>
                <Label>Tipo de piso actual y a cotizar</Label>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200 min-w-[200px]">Material</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">Actual</th>
                        <th className="px-3 py-2 font-medium text-gray-600 border-b border-gray-200 text-center">A cotizar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {TIPOS_PISO.map(mat => (
                        <tr key={mat} className="hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-700">{mat}</td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={tipoPiso[mat]?.actual ?? false} onChange={() => togglePiso(mat, 'actual')} className="accent-blue-600" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <input type="checkbox" checked={tipoPiso[mat]?.aCotizar ?? false} onChange={() => togglePiso(mat, 'aCotizar')} className="accent-blue-600" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <Label>¿El piso tiene base adicional? (madera, mortero, otro)</Label>
                <RadioGroup name="pisoBase" options={['Sí', 'No', 'No sé']} value={f.pisoBaseAdicional || ''} onChange={v => sf('pisoBaseAdicional', v)} />
              </div>

              <div>
                <Label>¿Problemas detectados en piso o plataforma?</Label>
                <div className="space-y-2">
                  {PROBLEMAS_PISO.map(p => (
                    <label key={p} className="flex items-center gap-2.5 cursor-pointer">
                      <input type="checkbox" checked={problemasPiso.includes(p)} onChange={() => toggleCheck(problemasPiso, setProblemasPiso, p)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{p}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={problemasPiso.includes('Otro')} onChange={() => toggleCheck(problemasPiso, setProblemasPiso, 'Otro')} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">Otro</span>
                  </label>
                </div>
              </div>

              <div>
                <Label required>Descripción del requerimiento</Label>
                <textarea
                  value={f.descripcionPiso || ''}
                  onChange={e => sf('descripcionPiso', e.target.value)}
                  rows={4}
                  placeholder="Describa detalladamente lo que necesita..."
                  className={`${InputClass()} resize-none`}
                />
              </div>

              <div>
                <Label>Fotos del piso actual</Label>
                <PhotoUploader
                  photos={fotosPiso}
                  onUpload={makeUploadHandler('piso', fotosPiso, setFotosPiso)}
                  onRemove={i => setFotosPiso(p => p.filter((_, idx) => idx !== i))}
                  uploading={uploadingSec === 'piso'}
                  error={photoError}
                />
              </div>
            </SectionCard>
          )}

          {/* ── SECCIÓN 5: Puertas de piso ────────────────────────────────── */}
          {tipoCotizacion === 'Pintura de puertas de piso' && (
            <SectionCard
              title="Restauración de Puertas de Piso"
              subtitle="Las puertas de piso pueden ser mejoradas enchapándolas en acero inoxidable, satinando el acero inoxidable o pintándolas."
            >
              <div>
                <Label required>Número de pisos</Label>
                <input
                  type="text"
                  value={f.numPisos || ''}
                  onChange={e => sf('numPisos', e.target.value)}
                  placeholder="Ej: 10"
                  className={InputClass()}
                />
              </div>

              <div>
                <Label required>Tipo de puertas de piso</Label>
                <div className="space-y-2">
                  {TIPOS_PUERTA_PISO.map(t => (
                    <label key={t} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tipoPuertasPiso.includes(t)}
                        onChange={() => toggleCheck(tipoPuertasPiso, setTipoPuertasPiso, t)}
                        className="accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tipoPuertasPiso.includes('Otro')}
                      onChange={() => toggleCheck(tipoPuertasPiso, setTipoPuertasPiso, 'Otro')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">Otro</span>
                  </label>
                </div>
                {tipoPuertasPiso.includes('Otro') && (
                  <input
                    type="text"
                    value={f.tipoPuertasPisoOtro || ''}
                    onChange={e => sf('tipoPuertasPisoOtro', e.target.value)}
                    placeholder="Especifique..."
                    className={`${InputClass()} mt-2`}
                  />
                )}
              </div>

              <div>
                <Label>Tipo de marco</Label>
                <div className="flex flex-wrap gap-4">
                  {TIPOS_MARCO.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tipoMarco" value={t} checked={f.tipoMarco === t} onChange={() => sf('tipoMarco', t)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="tipoMarco" value="Otro" checked={f.tipoMarco === 'Otro'} onChange={() => sf('tipoMarco', 'Otro')} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">Otro</span>
                  </label>
                </div>
                {f.tipoMarco === 'Otro' && (
                  <input type="text" value={f.tipoMarcoOtro || ''} onChange={e => sf('tipoMarcoOtro', e.target.value)} placeholder="Especifique..." className={`${InputClass()} mt-2`} />
                )}
              </div>

              <div>
                <Label>Acabado puertas primer piso (Lobby)</Label>
                <div className="flex flex-wrap gap-4">
                  {ACABADOS_PUERTA.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="acabadoLobby" value={t} checked={f.acabadoPuertasLobby === t} onChange={() => sf('acabadoPuertasLobby', t)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="acabadoLobby" value="Otro" checked={f.acabadoPuertasLobby === 'Otro'} onChange={() => sf('acabadoPuertasLobby', 'Otro')} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">Otro</span>
                  </label>
                </div>
                {f.acabadoPuertasLobby === 'Otro' && (
                  <input type="text" value={f.acabadoPuertasLobbyOtro || ''} onChange={e => sf('acabadoPuertasLobbyOtro', e.target.value)} placeholder="Especifique..." className={`${InputClass()} mt-2`} />
                )}
              </div>

              <div>
                <Label>Acabado puertas otros pisos</Label>
                <div className="flex flex-wrap gap-4">
                  {ACABADOS_PUERTA.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="acabadoOtros" value={t} checked={f.acabadoPuertasOtrosPisos === t} onChange={() => sf('acabadoPuertasOtrosPisos', t)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="acabadoOtros" value="Otro" checked={f.acabadoPuertasOtrosPisos === 'Otro'} onChange={() => sf('acabadoPuertasOtrosPisos', 'Otro')} className="accent-blue-600" />
                    <span className="text-sm text-gray-700">Otro</span>
                  </label>
                </div>
                {f.acabadoPuertasOtrosPisos === 'Otro' && (
                  <input type="text" value={f.acabadoPuertasOtrosOtro || ''} onChange={e => sf('acabadoPuertasOtrosOtro', e.target.value)} placeholder="Especifique..." className={`${InputClass()} mt-2`} />
                )}
              </div>

              <div>
                <Label required>Descripción del requerimiento</Label>
                <textarea
                  value={f.descripcionPuertas || ''}
                  onChange={e => sf('descripcionPuertas', e.target.value)}
                  rows={4}
                  placeholder="Describa detalladamente lo que necesita..."
                  className={`${InputClass()} resize-none`}
                />
              </div>

              <div>
                <Label>Fotos de las puertas actuales</Label>
                <PhotoUploader
                  photos={fotosPuertas}
                  onUpload={makeUploadHandler('puertas', fotosPuertas, setFotosPuertas)}
                  onRemove={i => setFotosPuertas(p => p.filter((_, idx) => idx !== i))}
                  uploading={uploadingSec === 'puertas'}
                  error={photoError}
                />
              </div>
            </SectionCard>
          )}

          {/* ── SECCIÓN 6: Requerimiento especial / Otros ─────────────────── */}
          {tipoCotizacion === 'Otro' && (
            <SectionCard title="Requerimiento Especial / Otros">
              <div>
                <Label>Descripción (opcional)</Label>
                <textarea
                  value={f.descripcionOtro || ''}
                  onChange={e => sf('descripcionOtro', e.target.value)}
                  rows={3}
                  placeholder="Información adicional..."
                  className={`${InputClass()} resize-none`}
                />
              </div>

              <div>
                <Label required>Descripción del requerimiento</Label>
                <textarea
                  value={f.descripcionOtroReq || ''}
                  onChange={e => sf('descripcionOtroReq', e.target.value)}
                  rows={4}
                  placeholder="Describa detalladamente lo que necesita..."
                  className={`${InputClass()} resize-none`}
                />
              </div>

              <div>
                <Label>Fotos</Label>
                <PhotoUploader
                  photos={fotosOtro}
                  onUpload={makeUploadHandler('otro', fotosOtro, setFotosOtro)}
                  onRemove={i => setFotosOtro(p => p.filter((_, idx) => idx !== i))}
                  uploading={uploadingSec === 'otro'}
                  error={photoError}
                />
              </div>
            </SectionCard>
          )}

          {/* ── Error del servidor ─────────────────────────────────────────── */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          {/* ── Botón de envío ─────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={isLoading || isUploading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>

        <p className="text-center text-blue-200 text-xs pb-6">
          Vertical Ingeniería © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
