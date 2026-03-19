// ============================================
// PÁGINA: Posts List → RUTA ESTÁTICA: /posts
// ============================================
// Lista todos los posts publicados.
// Demuestra: Consultas con Prisma (findMany con filtros,
// include para JOINs, orderBy para ordenar)

import Link from 'next/link';
import prisma from '@/lib/prisma';

export const metadata = {
  title: 'Todos los Posts',
};

export default async function PostsPage() {
  // ---- Consulta Prisma: SELECT con JOIN, WHERE, ORDER BY ----
  // Equivalente SQL:
  //   SELECT p.*, u.name as author_name
  //   FROM posts p
  //   JOIN users u ON p.authorId = u.id
  //   WHERE p.published = true
  //   ORDER BY p.createdAt DESC
  const posts = await prisma.post.findMany({
    where: { published: true },          // WHERE
    include: {                             // JOIN
      author: {
        select: { name: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },       // ORDER BY
  });

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="flex-between">
        <h1>Todos los Posts ({posts.length})</h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center mt-4">
          <p style={{ color: '#6b7280' }}>No hay posts publicados todavía.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              {post.image && (
                <img src={post.image} alt={post.title} />
              )}
              <h3>
                {/* Link a la ruta dinámica /posts/[id] */}
                <Link href={`/posts/${post.id}`}>
                  {post.title}
                </Link>
              </h3>
              <p>{post.content.substring(0, 150)}...</p>
              <div className="meta">
                ✍️ {post.author.name}
                <span className={`badge badge-${post.author.role}`} style={{ marginLeft: '0.5rem' }}>
                  {post.author.role}
                </span>
                <br />
                📅 {new Date(post.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
