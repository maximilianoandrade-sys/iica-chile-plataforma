import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.project.count();
  console.log(`Total projects in DB: ${count}`);
  if (count > 0) {
      const first = await prisma.project.findFirst();
      console.log('First project:', JSON.stringify(first, null, 2));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
