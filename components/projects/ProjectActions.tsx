'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Edit2, Trash2, X } from 'lucide-react';
import Link from 'next/link';

interface ProjectActionsProps {
  projectId: string;
  projectTitle: string;
}

export default function ProjectActions({ projectId, projectTitle }: ProjectActionsProps) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error eliminando proyecto');
      }

      toast.success('Proyecto eliminado exitosamente');
      router.push('/projects');
      router.refresh();
    } catch (error) {
      console.error('Error eliminando proyecto:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Link href={`/projects/${projectId}/edit`}>
          <Button variant="secondary" className="flex items-center gap-2">
            <Edit2 size={16} />
            Editar
          </Button>
        </Link>
        <Button
          variant="secondary"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center gap-2 text-red-600 hover:bg-red-50 border-red-200"
        >
          <Trash2 size={16} />
          Eliminar
        </Button>
      </div>

      {/* Modal de Confirmación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Eliminar Proyecto</h3>
                <p className="text-sm text-gray-600 mt-1">
                  ¿Estás seguro de que quieres eliminar este proyecto?
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={deleting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800 font-medium mb-1">{projectTitle}</p>
              <p className="text-xs text-red-600">
                Esta acción no se puede deshacer. Se eliminarán todas las imágenes, comentarios y
                datos asociados.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                isLoading={deleting}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Eliminar Proyecto
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
