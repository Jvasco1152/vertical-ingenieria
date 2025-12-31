'use client';

import { Notification } from '@prisma/client';
import Link from 'next/link';
import { MessageSquare, Image, TrendingUp, CheckCircle, UserPlus } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification & { project: { id: string; title: string } };
  onMarkAsRead: (id: string) => void;
  onClick: () => void;
}

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onClick();
  };

  // Helper para obtener ícono según el tipo
  const getIcon = () => {
    if (notification.title.includes('comentario') || notification.title.includes('Comentario')) {
      return <MessageSquare size={20} className="text-blue-600" />;
    }
    if (notification.title.includes('imagen') || notification.title.includes('Imagen')) {
      return <Image size={20} className="text-green-600" />;
    }
    if (notification.title.includes('fase') || notification.title.includes('Fase')) {
      return <TrendingUp size={20} className="text-purple-600" />;
    }
    if (notification.title.includes('completado') || notification.title.includes('Completado')) {
      return <CheckCircle size={20} className="text-emerald-600" />;
    }
    if (notification.title.includes('Asignado')) {
      return <UserPlus size={20} className="text-amber-600" />;
    }
    return <MessageSquare size={20} className="text-gray-600" />;
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

  return (
    <Link
      href={`/projects/${notification.projectId}`}
      onClick={handleClick}
      className={`block p-4 hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Ícono */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p
              className={`text-sm font-semibold ${
                !notification.read ? 'text-gray-900' : 'text-gray-700'
              }`}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-1 line-clamp-2">{notification.message}</p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{getRelativeTime(notification.createdAt)}</span>
            <span>•</span>
            <span className="truncate">{notification.project.title}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
