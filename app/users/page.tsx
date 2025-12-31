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
  UserCog,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: 'ADMIN' | 'WORKER' | 'CLIENT';
  image: string | null;
  createdAt: Date;
  _count: {
    projectsAsClient: number;
    projectsAsWorker: number;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
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
      fetchUsers();
    }
  }, [search, roleFilter, session]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter !== 'ALL') params.append('role', roleFilter);

      const response = await fetch(`/api/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error obteniendo usuarios');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error eliminando usuario');
      }

      toast.success('Usuario eliminado exitosamente');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Error eliminando usuario');
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
      WORKER: 'bg-blue-100 text-blue-700 border-blue-200',
      CLIENT: 'bg-green-100 text-green-700 border-green-200',
    };
    const labels = {
      ADMIN: 'Administrador',
      WORKER: 'Trabajador',
      CLIENT: 'Cliente',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${badges[role as keyof typeof badges]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  if (!session || session.user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver al Dashboard
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra los usuarios del sistema</p>
        </div>
        <Link href="/users/new">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus size={20} />
            Nuevo Usuario
          </Button>
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtro por rol */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="ALL">Todos los roles</option>
          <option value="ADMIN">Administradores</option>
          <option value="WORKER">Trabajadores</option>
          <option value="CLIENT">Clientes</option>
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      )}

      {/* Tabla de usuarios */}
      {!loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Proyectos
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        {user.phone ? (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone size={14} />
                            {user.phone}
                          </p>
                        ) : (
                          <span className="text-sm text-gray-400">Sin teléfono</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {user.role === 'CLIENT' && (
                            <span>{user._count.projectsAsClient} como cliente</span>
                          )}
                          {user.role === 'WORKER' && (
                            <span>{user._count.projectsAsWorker} asignados</span>
                          )}
                          {user.role === 'ADMIN' && (
                            <span className="text-gray-400">Acceso total</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/users/${user.id}/edit`}>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar usuario"
                            >
                              <Edit size={18} />
                            </button>
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar usuario"
                            disabled={user.id === session.user.id}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCog className="text-gray-400" size={32} />
              </div>
              {search || roleFilter !== 'ALL' ? (
                <>
                  <p className="text-gray-600 font-medium mb-2">No se encontraron usuarios</p>
                  <p className="text-gray-500 text-sm">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 font-medium mb-4">No hay usuarios aún</p>
                  <Link href="/users/new">
                    <Button variant="primary">Crear primer usuario</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Contador de resultados */}
      {!loading && users.length > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Mostrando <span className="font-semibold">{users.length}</span>{' '}
            {users.length === 1 ? 'usuario' : 'usuarios'}
          </p>
        </div>
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
                    Eliminar Usuario
                  </h3>
                  <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar este usuario? Se eliminarán todos sus datos asociados.
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
