// ============================================
// ROUTE HANDLER (CONTROLADOR): POST /api/auth/logout
// ============================================
// Destruye la sesión del usuario y redirige al inicio.
//
// Usamos POST (no GET) porque logout es una acción que
// modifica estado (destruye la sesión). Es una buena práctica
// de seguridad para prevenir ataques CSRF de logout.
//
// URL: POST /api/auth/logout

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function POST() {
  try {
    // 1. Obtener la sesión actual
    const session = await getSession();

    // 2. Destruir la sesión (eliminar todos los datos)
    session.destroy();

    // 3. Redirigir al inicio
    // NextResponse.redirect() genera una respuesta HTTP 302/307
    // El navegador seguirá la redirección automáticamente
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));

  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
}
