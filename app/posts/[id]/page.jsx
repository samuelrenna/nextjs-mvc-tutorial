// ============================================
// PÁGINA: Post Detail → RUTA DINÁMICA: /posts/[id]
// ============================================
// Esta es una RUTA DINÁMICA. El [id] en el nombre de la
// carpeta se convierte en un parámetro que recibimos como prop.
//
// Ejemplo de URLs que coinciden con esta ruta:
//   /posts/1  → params.id = "1"
//   /posts/42 → params.id = "42"
//
// Es equivalente a:
//   Route::get('/posts/{id}', [PostController::class, 'show']);
//   en Laravel

import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

// ---- Metadata dinámica (varía según el post) ----
// Esta función genera el título de la pestaña según el post
export async function generateMetadata({ params }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
  });
  
  if (!post) {
    return { title: 'Post no encontrado' };
  }
  
  return {
    title: post.title,
    description: post.content.substring(0, 160),
  };
}

export default async function PostDetailPage({ params }) {
  // ---- Extraer el parámetro dinámico ----
  // params.id viene de la carpeta [id]
  const { id } = await params;
  const postId = parseInt(id);

  // ---- Validar que el ID es un número válido ----
  if (isNaN(postId)) {
    // notFound() dispara la página not-found.jsx
    // Es equivalente a: throw new NotFoundHttpException() en Symfony
    notFound();
  }

  // ---- Consulta Prisma: findUnique (SELECT ... WHERE id = ?) ----
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { name: true, role: true },
      },
    },
  });

  // ---- Manejar post no encontrado ----
  if (!post) {
    notFound(); // → Renderiza not-found.jsx
  }

  // ---- Manejar post no publicado ----
  if (!post.published) {
    notFound(); // Los borradores no son accesibles públicamente
  }

  return (
    <article className="post-detail">
      {/* ---- Navegación "breadcrumb" ---- */}
      <div style={{ marginBottom: '1rem' }}>
        <Link href="/posts">← Volver a posts</Link>
      </div>

      {/* ---- Imagen del post ---- */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          style={{
            width: '100%',
            maxHeight: '400px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '1.5rem',
          }}
        />
      )}

      {/* ---- Título y metadata ---- */}
      <h1>{post.title}</h1>
      <div className="meta">
        <span>✍️ Escrito por <strong>{post.author.name}</strong></span>
        <span className={`badge badge-${post.author.role}`} style={{ marginLeft: '0.5rem' }}>
          {post.author.role}
        </span>
        <br />
        <span>
          📅 {new Date(post.createdAt).toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </span>
        {post.updatedAt > post.createdAt && (
          <span style={{ marginLeft: '1rem' }}>
            (Actualizado: {new Date(post.updatedAt).toLocaleDateString('es-ES')})
          </span>
        )}
      </div>

      {/* ---- Contenido del post ---- */}
      <div className="content">
        {/* Renderizamos el contenido párrafo por párrafo */}
        {post.content.split('\n').map((paragraph, index) => (
          <p key={index} style={{ marginBottom: '1rem' }}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* ---- Slug del post (para demostrar datos adicionales) ---- */}
      <div className="mt-4" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
        Slug: <code>{post.slug}</code> · ID: <code>{post.id}</code>
      </div>
    </article>
  );
}
