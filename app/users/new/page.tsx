import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserForm from '@/components/users/UserForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Usuario</h1>
        <p className="text-gray-600 mt-2">Crea un nuevo usuario en el sistema</p>
      </div>

      <UserForm mode="create" />
    </div>
  );
}
