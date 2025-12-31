import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserForm from '@/components/users/UserForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { id } = await params;

  // Obtener datos del usuario
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
    },
  });

  if (!user) {
    redirect('/users');
  }

  const initialData = {
    name: user.name,
    email: user.email,
    role: user.role as 'ADMIN' | 'WORKER' | 'CLIENT',
    phone: user.phone || '',
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Volver a usuarios
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Editar Usuario</h1>
        <p className="text-gray-600 mt-2">Modifica la información del usuario</p>
      </div>

      <UserForm mode="edit" userId={id} initialData={initialData} />
    </div>
  );
}
