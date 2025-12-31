'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { Comment as CommentType } from '@prisma/client';
import Comment from './Comment';
import CommentForm from './CommentForm';
import Button from '@/components/ui/Button';

interface CommentListProps {
  projectId: string;
}

export default function CommentList({ projectId }: CommentListProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<
    (CommentType & {
      user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: string;
      };
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [projectId]);

  const fetchComments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      const response = await fetch(`/api/comments?projectId=${projectId}`);

      if (!response.ok) {
        throw new Error('Error obteniendo comentarios');
      }

      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Error cargando comentarios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchComments(false);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} strokeWidth={2} />
          Comentarios
          {comments.length > 0 && (
            <span className="text-sm font-normal text-gray-500">({comments.length})</span>
          )}
        </h2>
        {comments.length > 0 && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Actualizar comentarios"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* Formulario para nuevo comentario */}
      <div className="mb-6">
        <CommentForm projectId={projectId} onCommentAdded={() => fetchComments(false)} />
      </div>

      {/* Lista de comentarios */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              currentUserId={session.user.id}
              currentUserRole={session.user.role}
              onCommentUpdated={() => fetchComments(false)}
              onCommentDeleted={() => fetchComments(false)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="text-gray-400" size={24} strokeWidth={1.5} />
          </div>
          <p className="text-gray-600 font-medium">No hay comentarios aún</p>
          <p className="text-gray-500 text-sm mt-1">
            Sé el primero en comentar en este proyecto
          </p>
        </div>
      )}
    </div>
  );
}
