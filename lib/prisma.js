// ============================================
// LIB: Instancia Singleton de Prisma Client
// ============================================
// En desarrollo, Next.js recarga el código con Hot Reload,
// lo que puede crear múltiples instancias de PrismaClient.
// Este patrón "singleton" evita ese problema guardando
// la instancia en una variable global.

import { PrismaClient } from '@prisma/client';

// En desarrollo, usamos globalThis para mantener una sola instancia
// En producción, simplemente creamos una nueva instancia
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Descomentar para ver las queries SQL en la consola:
    // log: ['query', 'info', 'warn', 'error'],
  });

// Solo guardamos en global en desarrollo
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
