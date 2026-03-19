// ============================================
// PÁGINA: Home (Inicio) → RUTA ESTÁTICA: /
// ============================================
// Esta es una RUTA ESTÁTICA: la URL es fija ("/")
// El archivo vive en app/page.jsx → se mapea a "/"
//
// Es un Server Component por defecto, lo que significa que
// se ejecuta en el servidor y puede hacer consultas a la BD
// directamente sin necesidad de un endpoint API.

import Link from 'next/link';
import prisma from '@/lib/prisma';

// Metadata específica de esta página (sobreescribe la del layout)
export const metadata = {
  title: 'Inicio',
  description: 'Blog MVC Tutorial - Página principal',
};

export default async function HomePage() {
  // ---- Consulta a la BD directamente desde el componente ----
  // Obtenemos los últimos 6 posts publicados, incluyendo el autor
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: { select: { name: true } } }, // JOIN con User
    orderBy: { createdAt: 'desc' },
    take: 6, // LIMIT 6
  });

  return (
    <>
      {/* ---- Hero section ---- */}
      <section className="hero">
        <h1>Blog MVC con Next.js</h1>
        <p>
          Tutorial completo: rutas, controladores, formularios, ORM,
          sesiones, autenticación y más.
        </p>
        <Link href="/posts" className="btn btn-primary">
          Ver todos los posts
        </Link>
      </section>

      {/* ---- Grid de posts recientes ---- */}
      <section>
        <h2>Últimos Posts</h2>
        <div className="posts-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="post-card">
                {/* Imagen del post (si existe) */}
                {post.image && (
                  <img src={post.image} alt={post.title} />
                )}
                <h3>
                  <Link href={`/posts/${post.id}`}>
                    {post.title}
                  </Link>
                </h3>
                {/* Truncar contenido a 120 caracteres */}
                <p>{post.content.substring(0, 120)}...</p>
                <div className="meta">
                  Por {post.author.name} · {new Date(post.createdAt).toLocaleDateString('es-ES')}
                </div>
              </article>
            ))
          ) : (
            <p>No hay posts publicados aún.</p>
          )}
        </div>
      </section>
    </>
  );
}
