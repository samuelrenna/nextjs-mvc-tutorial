// ============================================
// ROUTE HANDLER (CONTROLADOR): /api/cookies
// ============================================
// Demuestra: Gestión de cookies desde el servidor
//
// GET  /api/cookies → Leer las cookies actuales
// POST /api/cookies → Guardar preferencias de cookies
//
// Next.js proporciona cookies() de 'next/headers' para
// leer y escribir cookies de forma segura desde el servidor.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================
// GET /api/cookies → Leer cookies actuales
// ============================================
export async function GET() {
  const cookieStore = await cookies();

  // Leer cookies específicas
  const consent = cookieStore.get('cookie_consent');
  const preferences = cookieStore.get('cookie_preferences');
  const theme = cookieStore.get('user_theme');

  return NextResponse.json({
    consent: consent?.value || null,
    preferences: preferences ? JSON.parse(preferences.value) : null,
    theme: theme?.value || 'light',
    // Listar todas las cookies (solo nombres, por seguridad)
    allCookieNames: cookieStore.getAll().map((c) => c.name),
  });
}

// ============================================
// POST /api/cookies → Guardar preferencias
// ============================================
export async function POST(request) {
  try {
    const body = await request.json();
    const { analytics, marketing, preferences } = body;

    const cookieStore = await cookies();

    // ---- Escribir cookie de preferencias ----
    // Guardamos las preferencias del usuario en una cookie JSON
    const cookiePreferences = JSON.stringify({
      analytics: analytics || false,
      marketing: marketing || false,
      preferences: preferences || false,
      updatedAt: new Date().toISOString(),
    });

    // Configuración de la cookie
    const cookieOptions = {
      httpOnly: true,       // No accesible desde JS del navegador
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',      // Protección CSRF
      maxAge: 60 * 60 * 24 * 365, // 1 año
      path: '/',             // Disponible en toda la app
    };

    // Escribir las cookies
    cookieStore.set('cookie_consent', 'accepted', cookieOptions);
    cookieStore.set('cookie_preferences', cookiePreferences, cookieOptions);

    return NextResponse.json({
      message: 'Preferencias de cookies guardadas',
      preferences: { analytics, marketing, preferences },
    });

  } catch (error) {
    console.error('Error guardando cookies:', error);
    return NextResponse.json(
      { error: 'Error al guardar las preferencias' },
      { status: 500 }
    );
  }
}
