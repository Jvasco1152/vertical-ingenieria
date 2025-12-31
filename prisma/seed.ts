import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  // Crear usuarios
  const hashedPassword = await hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vertical.com' },
    update: {},
    create: {
      email: 'admin@vertical.com',
      name: 'Admin Vertical',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+1234567890',
    },
  });

  const worker1 = await prisma.user.upsert({
    where: { email: 'carlos@vertical.com' },
    update: {},
    create: {
      email: 'carlos@vertical.com',
      name: 'Carlos García',
      password: hashedPassword,
      role: 'WORKER',
      phone: '+1234567891',
    },
  });

  const worker2 = await prisma.user.upsert({
    where: { email: 'ana@vertical.com' },
    update: {},
    create: {
      email: 'ana@vertical.com',
      name: 'Ana Martínez',
      password: hashedPassword,
      role: 'WORKER',
      phone: '+1234567892',
    },
  });

  const client1 = await prisma.user.upsert({
    where: { email: 'juan@cliente.com' },
    update: {},
    create: {
      email: 'juan@cliente.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1234567893',
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: 'maria@cliente.com' },
    update: {},
    create: {
      email: 'maria@cliente.com',
      name: 'María González',
      password: hashedPassword,
      role: 'CLIENT',
      phone: '+1234567894',
    },
  });

  console.log('Usuarios creados:', { admin, worker1, worker2, client1, client2 });

  // Crear proyectos
  const project1 = await prisma.project.create({
    data: {
      title: 'Edificio Corporativo Centro',
      description: 'Modernización de 3 ascensores con diseño contemporáneo incluyendo iluminación LED, paneles decorativos y acabados premium.',
      location: 'Av. Principal 123, Ciudad',
      clientId: client1.id,
      status: 'IN_PROGRESS',
      currentPhase: 'INSTALLATION',
      progress: 65,
      startDate: new Date('2024-01-10'),
      estimatedEndDate: new Date('2024-03-15'),
      budget: 25000,
      workers: {
        create: [
          { workerId: worker1.id },
          { workerId: worker2.id },
        ],
      },
      phases: {
        create: [
          {
            phase: 'MEASUREMENT',
            startedAt: new Date('2024-01-10'),
            completedAt: new Date('2024-01-15'),
            notes: 'Medición completada exitosamente',
          },
          {
            phase: 'DESIGN',
            startedAt: new Date('2024-01-16'),
            completedAt: new Date('2024-01-25'),
            notes: 'Diseño aprobado por el cliente',
          },
          {
            phase: 'INSTALLATION',
            startedAt: new Date('2024-01-26'),
            notes: 'Instalación en progreso',
          },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: 'Residencial Las Palmas',
      description: 'Instalación de iluminación LED y acabados de lujo en 2 ascensores residenciales.',
      location: 'Calle Secundaria 456, Ciudad',
      clientId: client2.id,
      status: 'IN_PROGRESS',
      currentPhase: 'DESIGN',
      progress: 40,
      startDate: new Date('2024-02-01'),
      estimatedEndDate: new Date('2024-04-01'),
      budget: 18000,
      workers: {
        create: [
          { workerId: worker1.id },
        ],
      },
      phases: {
        create: [
          {
            phase: 'MEASUREMENT',
            startedAt: new Date('2024-02-01'),
            completedAt: new Date('2024-02-05'),
            notes: 'Mediciones tomadas',
          },
          {
            phase: 'DESIGN',
            startedAt: new Date('2024-02-06'),
            notes: 'Trabajando en el diseño',
          },
        ],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: 'Hotel Plaza Mayor',
      description: 'Renovación completa de 5 ascensores con temática moderna y elegante.',
      location: 'Plaza Central 789, Ciudad',
      clientId: client1.id,
      status: 'PENDING',
      currentPhase: 'MEASUREMENT',
      progress: 10,
      estimatedEndDate: new Date('2024-05-20'),
      budget: 45000,
      workers: {
        create: [
          { workerId: worker2.id },
        ],
      },
    },
  });

  console.log('Proyectos creados:', { project1, project2, project3 });

  // Crear algunos comentarios
  await prisma.comment.createMany({
    data: [
      {
        projectId: project1.id,
        userId: client1.id,
        content: 'Me gusta mucho el diseño propuesto. ¿Cuándo empiezan la instalación?',
      },
      {
        projectId: project1.id,
        userId: worker1.id,
        content: 'Iniciamos la instalación la próxima semana. Todo va según lo planeado.',
      },
      {
        projectId: project2.id,
        userId: worker1.id,
        content: 'Completamos las mediciones. Adjunto las fotos en la galería.',
      },
    ],
  });

  console.log('Comentarios creados');

  // Crear notificaciones
  await prisma.notification.createMany({
    data: [
      {
        userId: client1.id,
        projectId: project1.id,
        title: 'Actualización de Proyecto',
        message: 'Se han subido nuevas fotos del progreso de la instalación',
      },
      {
        userId: client2.id,
        projectId: project2.id,
        title: 'Fase Completada',
        message: 'La fase de medición ha sido completada exitosamente',
      },
    ],
  });

  console.log('Notificaciones creadas');
  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n📧 Credenciales de prueba (password para todos: password123):');
  console.log('   Admin: admin@vertical.com');
  console.log('   Trabajador 1: carlos@vertical.com');
  console.log('   Trabajador 2: ana@vertical.com');
  console.log('   Cliente 1: juan@cliente.com');
  console.log('   Cliente 2: maria@cliente.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
