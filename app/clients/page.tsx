'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui/Button';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Users,
  Mail,
  Phone,
  Briefcase,
  ArrowLeft,
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  _count: {
    projectsAsClient: number;
  };
}

export default function ClientsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redirigir si no es ADMIN
  useEffect(() => {
    if (session && session.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchClients();
    }
  }, [search, session]);

  const fetchClients = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('role', 'CLIENT');
      if (search) params.append('search', search);

      const response = await fetch(`/api/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error obteniendo clientes');
      }

      const data = await response.json();
      setClients(data.users);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/users/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error eliminando cliente');
      }

      toast.success('Cliente eliminado exitosamente');
      setDeleteConfirm(null);
      fetchClients();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast.error(error.message || 'Error eliminando cliente');
    } finally {
      setDeleting(false);
    }
  };

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-2">Administra los clientes del sistema</p>
        </div>
        <Link href="/clients/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={20} />
            Nuevo Cliente
          </Button>
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      )}

      {/* Grid de clientes */}
      {!loading && (
        <>
          {clients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
                >
                  {/* Avatar y nombre */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-semibold text-lg">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                          Cliente
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} />
                      <span className="truncate">{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Estadísticas */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-100">
                    <Briefcase size={14} />
                    <span>
                      {client._count.projectsAsClient}{' '}
                      {client._count.projectsAsClient === 1 ? 'proyecto' : 'proyectos'}
                    </span>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2">
                    <Link href={`/clients/${client.id}/edit`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <Edit size={16} />
                        Editar
                      </button>
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(client.id)}
                      className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar cliente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-gray-400" size={32} />
              </div>
              {search ? (
                <>
                  <p className="text-gray-600 font-medium mb-2">No se encontraron clientes</p>
                  <p className="text-gray-500 text-sm">
                    Intenta ajustar la búsqueda
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 font-medium mb-4">No hay clientes aún</p>
                  <Link href="/clients/new">
                    <Button variant="primary">Crear primer cliente</Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Contador de resultados */}
          {clients.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Mostrando <span className="font-semibold">{clients.length}</span>{' '}
                {clients.length === 1 ? 'cliente' : 'clientes'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !deleting && setDeleteConfirm(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Cliente
                  </h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este cliente? Se eliminarán todos sus proyectos y datos asociados.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(deleteConfirm)}
                  isLoading={deleting}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
