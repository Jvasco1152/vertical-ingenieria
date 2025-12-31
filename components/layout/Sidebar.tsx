'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Briefcase, Users, Settings, BarChart3, Image, X, UserCog } from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Proyectos', href: '/projects', icon: Briefcase },
    { name: 'Galería', href: '/gallery', icon: Image },
    { name: 'Usuarios', href: '/users', icon: UserCog, adminOnly: true },
    { name: 'Clientes', href: '/clients', icon: Users, adminOnly: true },
    { name: 'Reportes', href: '/reports', icon: BarChart3, adminOnly: true },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header móvil */}
          <div className="lg:hidden flex justify-between items-center px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">V</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          {/* Menú */}
          <nav className="flex-1 overflow-y-auto px-8 py-4">
            <ul className="space-y-1">
              {menuItems
                .filter((item) => !item.adminOnly || session?.user?.role === 'ADMIN')
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={`
                          group relative flex items-center gap-3 pl-8 pr-4 py-2.5 rounded-lg
                          transition-all duration-200 ease-in-out
                          ${isActive
                            ? 'bg-gradient-to-r from-blue-50 to-transparent text-blue-600 font-medium'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        {/* Indicador de activo */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-700 rounded-r-full" />
                        )}

                        <Icon
                          size={20}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={`transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`}
                        />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center font-medium">
              Vertical Ingeniería © 2024
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
