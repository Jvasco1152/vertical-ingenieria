'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { Send } from 'lucide-react';

interface CommentFormProps {
  projectId: string;
  onCommentAdded: () => void;
}

export default function CommentForm({ projectId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('El comentario no puede estar vacío');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          projectId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear comentario');
      }

      toast.success('Comentario agregado exitosamente');
      setContent('');
      onCommentAdded();
    } catch (error) {
      console.error('Error creando comentario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe un comentario..."
          rows={3}
          maxLength={2000}
          disabled={loading}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            {content.length}/2000 caracteres
          </p>
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            disabled={loading || !content.trim()}
            className="flex items-center gap-2"
          >
            <Send size={16} />
            Enviar
          </Button>
        </div>
      </div>
    </form>
  );
}
