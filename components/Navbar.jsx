// ============================================
// COMPONENTE: Navbar (Barra de navegación)
// ============================================
// Este componente es un Server Component (por defecto en Next.js)
// Lee la sesión del servidor para mostrar links condicionales:
// - Si hay usuario logueado: muestra Dashboard y Logout
// - Si no hay sesión: muestra Login y Registro

import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';

export default async function Navbar() {
  // Leemos la sesión desde el servidor (no hay fetch, es directo)
  const user = await getCurrentUser();

  return (
    <nav className="navbar">
      <div className="container">
        {/* ---- Logo / Marca ---- */}
        <Link href="/" className="navbar-brand">
          📝 MVC Blog
        </Link>

        {/* ---- Links de navegación ---- */}
        <ul className="navbar-links">
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/posts">Posts</Link></li>
          <li><Link href="/about">Acerca de</Link></li>
          <li><Link href="/contact">Contacto</Link></li>

          {/* ---- Links condicionales según sesión ---- */}
          {/* Esto es el equivalente a {% if user %} */}
          {user ? (
            <>
              <li><Link href="/dashboard">Dashboard</Link></li>
              <li>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                  {user.name}{' '}
                  <span className={`badge badge-${user.role}`}>
                    {user.role}
                  </span>
                </span>
              </li>
              <li>
                {/* Logout es un formulario POST por seguridad */}
                <form action="/api/auth/logout" method="POST" style={{ display: 'inline' }}>
                  <button type="submit" className="btn btn-outline btn-sm">
                    Cerrar sesión
                  </button>
                </form>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/auth/login" className="btn btn-outline btn-sm">Login</Link></li>
              <li><Link href="/auth/register" className="btn btn-primary btn-sm">Registro</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
