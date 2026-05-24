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

    // cookie_consent: NO httpOnly — el banner la lee con document.cookie
    cookieStore.set('cookie_consent', 'accepted', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    // cookie_preferences: httpOnly — solo se lee desde el servidor
    cookieStore.set('cookie_preferences', cookiePreferences, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

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
