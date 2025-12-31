import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Vertical Ingeniería
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de Gestión de Proyectos
        </p>
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <p className="text-gray-700 mb-4">
            Diseño de interiores para ascensores
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Iluminación, decoración y estilo para elevar la experiencia del usuario
          </p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
