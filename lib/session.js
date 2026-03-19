// ============================================
// LIB: Configuración de Sesiones con iron-session
// ============================================
// iron-session almacena los datos de sesión en una cookie
// cifrada (encrypted). No necesita base de datos para sesiones.
//
// Flujo: Usuario hace login → guardamos sus datos en sesión
//        → en cada petición, leemos la cookie para saber quién es

import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

// Opciones de configuración para la cookie de sesión
export const sessionOptions = {
  password: process.env.SESSION_SECRET, // Clave de cifrado (mín. 32 chars)
  cookieName: 'mvc_tutorial_session',   // Nombre de la cookie
  cookieOptions: {
    // 'secure' debe ser true en producción (HTTPS)
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,    // No accesible desde JavaScript del navegador
    sameSite: 'lax',   // Protección contra CSRF
    maxAge: 60 * 60 * 24, // 24 horas de duración
  },
};

// ============================================
// getSession(): Obtener la sesión actual
// ============================================
// Uso en Server Components o Route Handlers:
//   const session = await getSession();
//   if (session.user) { ... } // Usuario logueado
export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession(cookieStore, sessionOptions);
  return session;
}

// ============================================
// getCurrentUser(): Atajo para obtener el usuario actual
// ============================================
// Retorna el usuario de la sesión o null si no hay sesión
export async function getCurrentUser() {
  const session = await getSession();
  return session.user || null;
}

// ============================================
// requireAuth(): Proteger rutas que requieren login
// ============================================
// Lanza un error si no hay usuario logueado
// Uso: const user = await requireAuth();
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

// ============================================
// requireRole(): Proteger rutas por rol
// ============================================
// Verifica que el usuario tiene un rol específico
// Uso: await requireRole('admin');
export async function requireRole(role) {
  const user = await requireAuth();
  const roleHierarchy = { user: 1, editor: 2, admin: 3 };
  
  if ((roleHierarchy[user.role] || 0) < (roleHierarchy[role] || 0)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}
