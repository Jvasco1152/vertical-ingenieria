import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      status: true,
    },
  });

  console.log('\n📊 Proyectos en la base de datos:');
  console.log(JSON.stringify(projects, null, 2));

  const images = await prisma.projectImage.findMany({
    select: {
      id: true,
      projectId: true,
      url: true,
      phase: true,
    },
  });

  console.log('\n🖼️  Imágenes en la base de datos:');
  console.log(JSON.stringify(images, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
