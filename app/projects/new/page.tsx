import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProjectForm from '@/components/projects/ProjectForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);

  // Solo ADMIN puede crear proyectos
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/projects');
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Volver a Proyectos
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Proyecto</h1>
        <p className="text-gray-600 mt-2">
          Crea un nuevo proyecto y asigna el equipo de trabajo
        </p>
      </div>

      {/* Formulario */}
      <ProjectForm mode="create" />
    </div>
  );
}
