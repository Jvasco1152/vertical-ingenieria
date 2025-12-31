import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ClientForm from '@/components/clients/ClientForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewClientPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Volver a clientes
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nuevo Cliente</h1>
        <p className="text-gray-600 mt-2">Crea un nuevo cliente en el sistema</p>
      </div>

      <ClientForm mode="create" />
    </div>
  );
}
