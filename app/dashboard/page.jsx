// ============================================
// PÁGINA: Dashboard → RUTA PROTEGIDA: /dashboard
// ============================================
// Esta página solo es accesible para usuarios logueados.
// El middleware.js intercepta las peticiones a /dashboard/*
// y redirige al login si no hay sesión.
//
// Demuestra: Rutas protegidas, datos de sesión, CRUD de posts

import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import DeletePostButton from '@/components/DeletePostButton';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage({ searchParams }) {
  // Obtener el usuario de la sesión
  const user = await getCurrentUser();
  
  // Doble verificación (el middleware ya protege, pero por seguridad)
  if (!user) {
    redirect('/auth/login');
  }

  // Verificar si hay mensaje de error (ej: acceso denegado)
  const error = searchParams?.error;

  // Consulta: Obtener los posts del usuario
  // Si es admin, ve todos los posts. Si no, solo los suyos.
  const whereClause = user.role === 'admin'
    ? {} // Admin ve todos
    : { authorId: user.id }; // Otros ven solo los suyos

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: { author: { select: { name: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Estadísticas rápidas
  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.published).length,
    drafts: posts.filter((p) => !p.published).length,
  };

  return (
    <div className="dashboard">
      {/* ---- Bienvenida con datos de sesión ---- */}
      <div className="flex-between">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: '#6b7280' }}>
            Bienvenido, <strong>{user.name}</strong>{' '}
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* user, editor y admin pueden crear posts */}
          <Link href="/dashboard/posts/new" className="btn btn-primary">
            + Nuevo Post
          </Link>
          {user.role === 'admin' && (
            <Link href="/dashboard/admin" className="btn btn-outline">
              Gestión de Usuarios
            </Link>
          )}
        </div>
      </div>

      {/* ---- Mensajes de error/feedback ---- */}
      {error === 'forbidden' && (
        <div className="alert alert-error mt-2">
          ⛔ No tienes permisos para acceder a esa sección.
        </div>
      )}

      {/* ---- Tarjetas de estadísticas ---- */}
      <div className="dashboard-grid mt-2">
        <div className="dashboard-card">
          <h3 style={{ fontSize: '2rem' }}>{stats.total}</h3>
          <p style={{ color: '#6b7280' }}>Posts totales</p>
        </div>
        <div className="dashboard-card">
          <h3 style={{ fontSize: '2rem', color: '#16a34a' }}>{stats.published}</h3>
          <p style={{ color: '#6b7280' }}>Publicados</p>
        </div>
        <div className="dashboard-card">
          <h3 style={{ fontSize: '2rem', color: '#f59e0b' }}>{stats.drafts}</h3>
          <p style={{ color: '#6b7280' }}>Borradores</p>
        </div>
      </div>

      {/* ---- Tabla de posts ---- */}
      <h2 className="mt-4">
        {user.role === 'admin' ? 'Todos los posts' : 'Mis posts'}
      </h2>
      <div className="table-wrapper mt-1">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                  No hay posts todavía. ¡Crea el primero!
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link href={`/posts/${post.id}`}>{post.title}</Link>
                  </td>
                  <td>{post.author.name}</td>
                  <td>
                    {post.published ? (
                      <span className="badge badge-admin">Publicado</span>
                    ) : (
                      <span className="badge badge-editor">Borrador</span>
                    )}
                  </td>
                  <td>{new Date(post.createdAt).toLocaleDateString('es-ES')}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* Admin edita cualquier post; editor solo los suyos o los de users */}
                      {(user.role === 'admin' ||
                        (user.role === 'editor' && (post.authorId === user.id || post.author.role === 'user'))) && (
                        <Link href={`/dashboard/posts/${post.id}/edit`} className="btn btn-outline btn-sm">
                          Editar
                        </Link>
                      )}
                      {/* Admin borra cualquier post; editor solo el suyo */}
                      {(user.role === 'admin' ||
                        (user.role === 'editor' && post.authorId === user.id)) && (
                        <DeletePostButton postId={post.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
