import { getEnv } from '@/lib/utils/env';
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// ponytail: getEnv() valida DATABASE_URL/ADMIN_SESSION_SECRET, que NO existen en el
// bundle del cliente (Next solo inlinea NEXT_PUBLIC_*). lib/data se importa desde
// componentes cliente y arrastra lib/prisma, así getEnv() se ejecutaba en el navegador
// y crasheaba la app. El cacheo global solo importa en dev server, nunca en cliente.
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prisma;
}
