import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProjectForm, { ProjectFormData } from '@/components/projects/ProjectForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  // Solo ADMIN puede editar proyectos
  if (!session || session.user.role !== 'ADMIN') {
    redirect(`/projects/${id}`);
  }

  // Obtener proyecto
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      workers: {
        select: {
          workerId: true,
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Preparar datos iniciales del formulario
  const initialData: ProjectFormData = {
    title: project.title,
    description: project.description,
    location: project.location,
    clientId: project.clientId,
    status: project.status,
    currentPhase: project.currentPhase,
    progress: project.progress,
    startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : '',
    estimatedEndDate: project.estimatedEndDate
      ? project.estimatedEndDate.toISOString().split('T')[0]
      : '',
    budget: project.budget,
    workerIds: project.workers.map((w) => w.workerId),
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/projects/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Volver al Proyecto
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Proyecto</h1>
        <p className="text-gray-600 mt-2">{project.title}</p>
      </div>

      {/* Formulario */}
      <ProjectForm mode="edit" projectId={id} initialData={initialData} />
    </div>
  );
}
