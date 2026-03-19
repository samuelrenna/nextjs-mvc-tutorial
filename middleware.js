// ============================================
// MIDDLEWARE: Control de acceso por rutas
// ============================================
// El middleware de Next.js se ejecuta ANTES de cada petición.
// Aquí verificamos si el usuario tiene sesión y permisos
// para acceder a las rutas protegidas.
//
// Funciona como un "guardia" que intercepta las peticiones
// y decide si deja pasar o redirige al login.

import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

// Configuración de sesión (duplicada aquí porque middleware
// se ejecuta en el Edge Runtime, que tiene limitaciones)
const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'mvc_tutorial_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  },
};

// ============================================
// Definición de rutas protegidas y permisos
// ============================================
const protectedRoutes = [
  // Rutas que requieren estar logueado (cualquier rol)
  { path: '/dashboard', roles: ['user', 'editor', 'admin'] },
  { path: '/dashboard/posts/new', roles: ['editor', 'admin'] },
  // Rutas exclusivas de admin
  { path: '/dashboard/admin', roles: ['admin'] },
];

// ============================================
// Función principal del Middleware
// ============================================
export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta actual necesita protección
  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );

  // Si no es una ruta protegida, dejar pasar
  if (!matchedRoute) {
    return NextResponse.next();
  }

  // Obtener la sesión desde las cookies de la petición
  const response = NextResponse.next();
  const session = await getIronSession(
    request.cookies, // Leemos cookies de la request
    // No podemos escribir cookies desde aquí directamente
    { ...sessionOptions, cookieOptions: { ...sessionOptions.cookieOptions } }
  );

  // Si no hay usuario en sesión → redirigir al login
  if (!session.user) {
    const loginUrl = new URL('/auth/login', request.url);
    // Guardamos la URL original para redirigir después del login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verificar que el rol del usuario tiene permiso
  if (!matchedRoute.roles.includes(session.user.role)) {
    // No tiene permisos → redirigir a página de acceso denegado
    const forbiddenUrl = new URL('/dashboard', request.url);
    forbiddenUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(forbiddenUrl);
  }

  // Todo OK → dejar pasar
  return response;
}

// ============================================
// Configuración: En qué rutas se ejecuta el middleware
// ============================================
// Usamos un matcher para que solo se ejecute en /dashboard/*
// Esto mejora el rendimiento al no ejecutarse en rutas públicas
export const config = {
  matcher: ['/dashboard/:path*'],
};
