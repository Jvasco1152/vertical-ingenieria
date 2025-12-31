'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Edit2, Trash2, X, Check } from 'lucide-react';
import { Comment as CommentType } from '@prisma/client';

interface CommentProps {
  comment: CommentType & {
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
      role: string;
    };
  };
  currentUserId: string;
  currentUserRole: string;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
}

export default function Comment({
  comment,
  currentUserId,
  currentUserRole,
  onCommentUpdated,
  onCommentDeleted,
}: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [loading, setLoading] = useState(false);

  const isOwner = comment.userId === currentUserId;
  const isAdmin = currentUserRole === 'ADMIN';
  const canEdit = isOwner || isAdmin;
  const canDelete = isOwner || isAdmin;

  const handleUpdate = async () => {
    if (!editContent.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar comentario');
      }

      toast.success('Comentario actualizado exitosamente');
      setIsEditing(false);
      onCommentUpdated();
    } catch (error) {
      console.error('Error actualizando comentario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar comentario');
      }

      toast.success('Comentario eliminado exitosamente');
      onCommentDeleted();
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  // Helper para formatear fecha relativa
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  // Helper para badge de rol
  const getRoleBadge = (role: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      ADMIN: { label: 'Admin', className: 'bg-purple-50 text-purple-700 border border-purple-200' },
      WORKER: { label: 'Trabajador', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
      CLIENT: { label: 'Cliente', className: 'bg-green-50 text-green-700 border border-green-200' },
    };
    return badges[role] || badges.CLIENT;
  };

  const roleBadge = getRoleBadge(comment.user.role);

  return (
    <div className="flex gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
          {comment.user.name.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{comment.user.name}</span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleBadge.className}`}>
              {roleBadge.label}
            </span>
            <span className="text-xs text-gray-500">
              {getRelativeTime(comment.createdAt)}
            </span>
          </div>

          {/* Acciones */}
          {!isEditing && (canEdit || canDelete) && (
            <div className="flex items-center gap-1">
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                  title="Editar"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Contenido del comentario */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              maxLength={2000}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 resize-none"
            />
            <div className="flex items-center gap-2">
              <Button
                onClick={handleUpdate}
                variant="primary"
                isLoading={loading}
                disabled={loading || !editContent.trim()}
                className="text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <Check size={14} />
                Guardar
              </Button>
              <Button
                onClick={handleCancelEdit}
                variant="secondary"
                disabled={loading}
                className="text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <X size={14} />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}
