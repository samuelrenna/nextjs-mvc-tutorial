// ============================================
// PÁGINA: Admin Panel → RUTA PROTEGIDA: /dashboard/admin
// ============================================
// Solo accesible por usuarios con rol "admin".
// El middleware.js verifica el rol antes de permitir acceso.
//
// Demuestra: Control de acceso por PERMISOS/ROLES
// Si un usuario con rol "user" o "editor" intenta acceder,
// el middleware le redirige a /dashboard?error=forbidden

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export const metadata = {
  title: 'Panel de Administración',
};

export default async function AdminPage() {
  // Doble verificación de permisos (el middleware ya protege)
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    redirect('/dashboard?error=forbidden');
  }

  // Consultas de administración
  const [users, postCount, userCount] = await Promise.all([
    // Todos los usuarios con conteo de posts
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { posts: true } }, // COUNT de posts por usuario
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.post.count(),   // Total de posts
    prisma.user.count(),   // Total de usuarios
  ]);

  return (
    <div className="dashboard">
      <div className="flex-between">
        <div>
          <h1>Panel de Administración</h1>
          <p style={{ color: '#6b7280' }}>
            Gestión de usuarios y contenido (solo para administradores)
          </p>
        </div>
        <a href="/dashboard" className="btn btn-outline">← Dashboard</a>
      </div>

      {/* ---- Estadísticas globales ---- */}
      <div className="dashboard-grid mt-2">
        <div className="dashboard-card">
          <h3 style={{ fontSize: '2rem' }}>{userCount}</h3>
          <p style={{ color: '#6b7280' }}>Usuarios registrados</p>
        </div>
        <div className="dashboard-card">
          <h3 style={{ fontSize: '2rem' }}>{postCount}</h3>
          <p style={{ color: '#6b7280' }}>Posts totales</p>
        </div>
      </div>

      {/* ---- Tabla de usuarios ---- */}
      <h2 className="mt-4">Usuarios Registrados</h2>
      <div className="table-wrapper mt-1">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Posts</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </td>
                <td>{u._count.posts}</td>
                <td>{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
