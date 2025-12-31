'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCheck, Trash2, RefreshCw } from 'lucide-react';
import { Notification } from '@prisma/client';
import NotificationItem from './NotificationItem';
import Button from '@/components/ui/Button';

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<
    (Notification & { project: { id: string; title: string } })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');

      if (!response.ok) {
        throw new Error('Error obteniendo notificaciones');
      }

      const data = await response.json();
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarking(true);

    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error marcando notificaciones');
      }

      toast.success('Todas las notificaciones marcadas como leídas');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Error marcando notificaciones');
    } finally {
      setMarking(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationIds: [notificationId],
        }),
      });

      if (!response.ok) {
        throw new Error('Error marcando notificación');
      }

      // Actualizar estado local
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Error marcando notificación');
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {unreadNotifications.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {unreadNotifications.length} sin leer
            </span>
            <Button
              onClick={handleMarkAllAsRead}
              variant="secondary"
              isLoading={marking}
              disabled={marking}
              className="text-xs px-3 py-1.5 flex items-center gap-1.5"
            >
              <CheckCheck size={14} />
              Marcar todas como leídas
            </Button>
          </div>
        )}
      </div>

      {/* Lista de notificaciones */}
      <div className="overflow-y-auto max-h-[500px]">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onClick={onClose}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No hay notificaciones</p>
            <p className="text-gray-500 text-sm mt-1">
              Te avisaremos cuando haya novedades
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Bell({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
