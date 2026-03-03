'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createQuoteRequestSchema, type CreateQuoteRequestInput } from '@/lib/validations/quoteRequest';
import { CheckCircle2, Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

const TIPOS_CLIENTE = [
  'Otis',
  'Cliente Directo',
  'Conecta',
  'Ascensores Schindler',
  'Soluciones Verticales',
  'Mitsubishi',
] as const;

const CIUDADES = [
  'Medellín',
  'Sabaneta',
  'Itagui',
  'Envigado',
  'Bello',
  'Rionegro',
  'Copacabana',
  'Girardota',
  'Otro',
] as const;

const TIPOS_COTIZACION = [
  'Restauración completa y/o parcial de cabina',
  'Solo mejora en iluminación o cambio de cielo falso',
  'Solo cambio de piso o restauración de plataforma',
  'Pintura de puertas de piso',
  'Otro',
] as const;

// Tipos de cielo falso con sus descripciones.
// Reemplaza la propiedad `imagen` con la URL real de Cloudinary cuando tengas las fotos.
const TIPOS_CIELO_FALSO = [
  {
    id: 'Tipo A',
    letra: 'A',
    descripcion: 'Cielo falso en acero inoxidable con iluminación led dirigible',
    imagen: null as string | null,
  },
  {
    id: 'Tipo B',
    letra: 'B',
    descripcion: 'Cielo falso en acero inoxidable con iluminación led dirigible en arco',
    imagen: null as string | null,
  },
  {
    id: 'Tipo C',
    letra: 'C',
    descripcion: 'Cielo falso en acero inoxidable con iluminación led recesada',
    imagen: null as string | null,
  },
  {
    id: 'Tipo D',
    letra: 'D',
    descripcion: 'Cielo falso en combinación de acero inoxidable y lámina pintada negro, con iluminación led dirigible',
    imagen: null as string | null,
  },
  {
    id: 'Tipo E',
    letra: 'E',
    descripcion: 'Cielo falso en acero inoxidable con iluminación led dirigible en paneles horizontales',
    imagen: null as string | null,
  },
] as const;

export default function SolicitudPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Estado para fotos del cielo falso actual (manejadas fuera de react-hook-form)
  const [cieloFalsoPhotos, setCieloFalsoPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateQuoteRequestInput>({
    resolver: zodResolver(createQuoteRequestSchema),
  });

  const ciudadValue = watch('ciudad');
  const tipoCotizacionValue = watch('tipoCotizacion');
  const tipoCieloFalsoValue = watch('tipoCieloFalso');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPhotoError(null);

    const remaining = 5 - cieloFalsoPhotos.length;
    if (remaining <= 0) {
      setPhotoError('Ya alcanzaste el límite de 5 fotos');
      return;
    }

    const filesToUpload = files.slice(0, remaining);
    setUploadingPhoto(true);

    for (const file of filesToUpload) {
      if (file.size > 10 * 1024 * 1024) {
        setPhotoError(`"${file.name}" supera los 10 MB`);
        continue;
      }

      try {
        const signRes = await fetch('/api/cloudinary/sign-public', { method: 'POST' });
        if (!signRes.ok) throw new Error('Error al preparar el upload');
        const { signature, timestamp, folder, cloudName, apiKey } = await signRes.json();

        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('folder', folder);
        formData.append('api_key', apiKey);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData }
        );
        if (!uploadRes.ok) throw new Error('Error al subir la foto');

        const uploadData = await uploadRes.json();
        setCieloFalsoPhotos((prev) => [...prev, uploadData.secure_url]);
      } catch {
        setPhotoError('Error al subir una o más fotos. Intenta de nuevo.');
      }
    }

    setUploadingPhoto(false);
    // Limpiar el input para permitir volver a seleccionar el mismo archivo
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setCieloFalsoPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateQuoteRequestInput) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          fotosCieloFalso: cieloFalsoPhotos,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Error al enviar la solicitud');
      }

      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al enviar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud enviada!</h2>
          <p className="text-gray-600 mb-6">
            Hemos recibido tu solicitud de cotización. Nuestro equipo la revisará y se pondrá en contacto contigo pronto.
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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Solicitud de Cotización</h1>
          <p className="text-blue-100">
            Vertical Ingeniería — Diseño y modernización de ascensores
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Tipo de cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de cliente <span className="text-red-500">*</span>
              </label>
              <select
                {...register('tipoCliente')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Seleccionar...</option>
                {TIPOS_CLIENTE.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoCliente && (
                <p className="mt-1 text-xs text-red-500">{errors.tipoCliente.message}</p>
              )}
            </div>

            {/* Obra / Edificio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Obra / Edificio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('obraEdificio')}
                placeholder="Nombre del edificio o proyecto"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.obraEdificio && (
                <p className="mt-1 text-xs text-red-500">{errors.obraEdificio.message}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register('direccion')}
                placeholder="Dirección del edificio"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {errors.direccion && (
                <p className="mt-1 text-xs text-red-500">{errors.direccion.message}</p>
              )}
            </div>

            {/* Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CIUDADES.map((ciudad) => (
                  <label key={ciudad} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={ciudad}
                      {...register('ciudad')}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700">{ciudad}</span>
                  </label>
                ))}
              </div>
              {errors.ciudad && (
                <p className="mt-1 text-xs text-red-500">{errors.ciudad.message}</p>
              )}
              {ciudadValue === 'Otro' && (
                <div className="mt-3">
                  <input
                    type="text"
                    {...register('ciudadOtro')}
                    placeholder="Especifique la ciudad"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {errors.ciudadOtro && (
                    <p className="mt-1 text-xs text-red-500">{errors.ciudadOtro.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Quién solicita */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Quién solicita?
              </label>
              <input
                type="text"
                {...register('quienSolicita')}
                placeholder="Nombre de la persona o empresa que solicita"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Tipo de cotización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de cotización <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {TIPOS_COTIZACION.map((tipo) => (
                  <label key={tipo} className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      value={tipo}
                      {...register('tipoCotizacion')}
                      className="accent-blue-600 mt-0.5 shrink-0"
                    />
                    <span className="text-sm text-gray-700">{tipo}</span>
                  </label>
                ))}
              </div>
              {errors.tipoCotizacion && (
                <p className="mt-1 text-xs text-red-500">{errors.tipoCotizacion.message}</p>
              )}
              {tipoCotizacionValue === 'Otro' && (
                <div className="mt-3">
                  <input
                    type="text"
                    {...register('tipoCotizacionOtro')}
                    placeholder="Especifique el tipo de cotización..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  {errors.tipoCotizacionOtro && (
                    <p className="mt-1 text-xs text-red-500">{errors.tipoCotizacionOtro.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* ─── SECCIÓN CIELO FALSO ─── */}
            <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-5 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wide mb-0.5">
                    Cambio de Cielo Falso
                  </h3>
                  <p className="text-xs text-gray-500">
                    Anexa la siguiente información si la tienes, y describe el requerimiento para saber qué cotizar.
                  </p>
                </div>

                {/* Dimensiones de cabina */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ancho de cabina (mm)
                    </label>
                    <input
                      type="text"
                      {...register('anchoCabina')}
                      placeholder="Ej: 1000"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    />
                    {errors.anchoCabina && (
                      <p className="mt-1 text-xs text-red-500">{errors.anchoCabina.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fondo de cabina (mm)
                    </label>
                    <input
                      type="text"
                      {...register('fondoCabina')}
                      placeholder="Ej: 1300"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    />
                    {errors.fondoCabina && (
                      <p className="mt-1 text-xs text-red-500">{errors.fondoCabina.message}</p>
                    )}
                  </div>
                </div>

                {/* Input oculto para registrar tipoCieloFalso en el form state */}
                <input type="hidden" {...register('tipoCieloFalso')} />

                {/* Selector visual de tipo de cielo falso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de cielo falso a cotizar
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TIPOS_CIELO_FALSO.map((tipo) => {
                      const isSelected = tipoCieloFalsoValue === tipo.id;
                      return (
                        <button
                          key={tipo.id}
                          type="button"
                          onClick={() => setValue('tipoCieloFalso', tipo.id)}
                          className={`relative rounded-xl border-2 overflow-hidden text-left transition-all focus:outline-none ${
                            isSelected
                              ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          {/* Área de imagen */}
                          <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            {tipo.imagen ? (
                              <Image
                                src={tipo.imagen}
                                alt={tipo.id}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-4xl font-black text-slate-300">{tipo.letra}</span>
                            )}
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          {/* Etiqueta */}
                          <div className="p-2.5">
                            <p className="text-xs font-bold text-gray-800">{tipo.id}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-tight line-clamp-2">{tipo.descripcion}</p>
                          </div>
                        </button>
                      );
                    })}

                    {/* Card "Otro" */}
                    <button
                      type="button"
                      onClick={() => setValue('tipoCieloFalso', 'Otro')}
                      className={`relative rounded-xl border-2 overflow-hidden text-left transition-all focus:outline-none ${
                        tipoCieloFalsoValue === 'Otro'
                          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="relative h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <span className="text-3xl font-black text-gray-200">?</span>
                        {tipoCieloFalsoValue === 'Otro' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow">
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-gray-800">Otro</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-tight">Especificar a continuación</p>
                      </div>
                    </button>
                  </div>

                  {/* Campo de texto cuando selecciona Otro */}
                  {tipoCieloFalsoValue === 'Otro' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        {...register('tipoCieloFalsoOtro')}
                        placeholder="Describa el tipo de cielo falso que necesita..."
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                      {errors.tipoCieloFalsoOtro && (
                        <p className="mt-1 text-xs text-red-500">{errors.tipoCieloFalsoOtro.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload de fotos del cielo falso actual */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fotos del cielo falso actual
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Máximo 5 fotos · Formatos: JPG, PNG, WEBP · Tamaño máximo: 10 MB por foto
                  </p>

                  {/* Preview de fotos subidas */}
                  {cieloFalsoPhotos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                      {cieloFalsoPhotos.map((url, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <Image
                            src={url}
                            alt={`Foto ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón de upload */}
                  {cieloFalsoPhotos.length < 5 && (
                    <label className={`flex items-center gap-2 w-full border-2 border-dashed rounded-lg px-4 py-3 text-sm transition cursor-pointer ${
                      uploadingPhoto
                        ? 'border-blue-300 bg-blue-50 text-blue-400 cursor-wait'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                    }`}>
                      {uploadingPhoto ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Subiendo fotos...
                        </>
                      ) : (
                        <>
                          <Upload size={16} />
                          {cieloFalsoPhotos.length === 0
                            ? 'Seleccionar fotos'
                            : `Agregar más (${cieloFalsoPhotos.length}/5)`}
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={uploadingPhoto}
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {photoError && (
                    <p className="mt-2 text-xs text-red-500">{photoError}</p>
                  )}
                </div>
              </div>

            {/* Descripción del requerimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción del requerimiento <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register('descripcion')}
                rows={4}
                placeholder="Describa detalladamente lo que necesita..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
              {errors.descripcion && (
                <p className="mt-1 text-xs text-red-500">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Datos de contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de contacto
                </label>
                <input
                  type="text"
                  {...register('nombreContacto')}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  {...register('telefonoContacto')}
                  placeholder="300 000 0000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Requerimiento especial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requerimiento especial
              </label>
              <textarea
                {...register('requerimientoEspecial')}
                rows={3}
                placeholder="Si tiene algún requerimiento especial, descríbalo aquí..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            {/* Error del servidor */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || uploadingPhoto}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-200 text-xs mt-6">
          Vertical Ingeniería © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
