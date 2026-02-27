'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createQuoteRequestSchema, type CreateQuoteRequestInput } from '@/lib/validations/quoteRequest';
import { CheckCircle2 } from 'lucide-react';

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
  'Modernización completa o parcial de cabina',
  'Pintura de puertas de piso',
  'Requerimiento especial',
] as const;

export default function SolicitudPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateQuoteRequestInput>({
    resolver: zodResolver(createQuoteRequestSchema),
  });

  const ciudadValue = watch('ciudad');

  const onSubmit = async (data: CreateQuoteRequestInput) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch('/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-10 px-4">
      <div className="max-w-2xl mx-auto">
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
                  <label
                    key={ciudad}
                    className="flex items-center gap-2 cursor-pointer"
                  >
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

              {/* Campo condicional para Otro */}
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

            {/* Descripción */}
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

            {/* Tipo de cotización */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de cotización <span className="text-red-500">*</span>
              </label>
              <select
                {...register('tipoCotizacion')}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="">Seleccionar...</option>
                {TIPOS_COTIZACION.map((tipo) => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoCotizacion && (
                <p className="mt-1 text-xs text-red-500">{errors.tipoCotizacion.message}</p>
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
              disabled={isLoading}
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
