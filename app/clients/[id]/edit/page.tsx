import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ClientForm from '@/components/clients/ClientForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { id } = await params;

  // Obtener datos del cliente
  const client = await prisma.user.findUnique({
    where: {
      id,
      role: 'CLIENT', // Solo permitir editar si es cliente
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  if (!client) {
    redirect('/clients');
  }

  const initialData = {
    name: client.name,
    email: client.email,
    phone: client.phone || '',
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
        <p className="text-gray-600 mt-2">Modifica la información del cliente</p>
      </div>

      <ClientForm mode="edit" clientId={id} initialData={initialData} />
    </div>
  );
}
