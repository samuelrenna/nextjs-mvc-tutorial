// ============================================
// SEED: Datos iniciales para la base de datos
// ============================================
// Este script crea usuarios y posts de ejemplo
// Se ejecuta con: npm run prisma:seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // ---- Crear usuarios de ejemplo ----
  const adminPassword = await bcrypt.hash('admin123', 10);
  const editorPassword = await bcrypt.hash('editor123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin Principal',
      password: adminPassword,
      role: 'admin',
    },
  });

  const editor = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      name: 'Editor Blog',
      password: editorPassword,
      role: 'editor',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Usuario Normal',
      password: userPassword,
      role: 'user',
    },
  });

  // ---- Crear posts de ejemplo ----
  const posts = [
    {
      title: 'Introducción a Next.js',
      slug: 'introduccion-a-nextjs',
      content: 'Next.js es un framework de React que permite crear aplicaciones web fullstack. Ofrece renderizado del lado del servidor (SSR), generación estática (SSG), y muchas más características que facilitan el desarrollo web moderno.',
      published: true,
      authorId: admin.id,
    },
    {
      title: 'Trabajando con Prisma ORM',
      slug: 'trabajando-con-prisma-orm',
      content: 'Prisma es un ORM moderno para Node.js y TypeScript. Permite definir modelos de datos de forma declarativa, ejecutar migraciones automáticas y realizar consultas de forma sencilla y type-safe.',
      published: true,
      authorId: editor.id,
    },
    {
      title: 'Gestión de sesiones en Next.js',
      slug: 'gestion-sesiones-nextjs',
      content: 'Las sesiones son fundamentales para mantener el estado del usuario entre peticiones HTTP. En Next.js podemos usar iron-session para manejar sesiones de forma segura usando cookies cifradas.',
      published: false,
      authorId: admin.id,
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log('✅ Seed completado:');
  console.log(`   - ${3} usuarios creados (admin, editor, user)`);
  console.log(`   - ${posts.length} posts creados`);
  console.log('');
  console.log('📧 Credenciales de acceso:');
  console.log('   admin@example.com / admin123 (rol: admin)');
  console.log('   editor@example.com / editor123 (rol: editor)');
  console.log('   user@example.com / user123 (rol: user)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
