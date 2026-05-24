// ============================================
// ROUTE HANDLER (CONTROLADOR): POST /api/auth/login
// ============================================
// Este archivo es un ROUTE HANDLER, que en Next.js es
// el equivalente directo a un CONTROLADOR en MVC.
//
// El archivo route.js dentro de app/api/auth/login/
// se mapea a la URL: /api/auth/login
//
// Al exportar una función llamada POST, estamos definiendo
// un endpoint que solo responde a peticiones POST.
//
// Equivalencias con otros frameworks:
//   Laravel: Route::post('/api/auth/login', [AuthController::class, 'login'])

import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { getSession } from '@/lib/session';

// Rate limiter en memoria: máximo 5 intentos por email por minuto.
// En producción (proceso único estable) funciona correctamente.
// En desarrollo Next.js puede reiniciar el módulo entre recargas.
// Para producción real, reemplazar con Redis o un store persistente.
const loginAttempts = new Map();

function checkRateLimit(email) {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = loginAttempts.get(key);

  if (!record || now > record.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (record.count >= 5) return false;
  record.count++;
  return true;
}

export async function POST(request) {
  try {
    // ---- 1. Leer el body de la petición (datos del formulario) ----
    const { email, password } = await request.json();

    // ---- 2. Validar que se enviaron los datos ----
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      );
    }

    // ---- 2b. Rate limiting ----
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Espera 1 minuto antes de volver a intentarlo.' },
        { status: 429 }
      );
    }

    // ---- 3. Autenticar al usuario ----
    // Busca en la BD y verifica la contraseña con bcrypt
    const user = await authenticateUser(email, password);

    if (!user) {
      // 401 Unauthorized - credenciales incorrectas
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // ---- 4. Crear la sesión ----
    // Guardamos los datos del usuario en la cookie de sesión cifrada
    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    await session.save(); // Cifra y guarda en la cookie

    // ---- 5. Responder con éxito ----
    // 200 OK con los datos del usuario (sin contraseña)
    return NextResponse.json({
      message: 'Login exitoso',
      user: session.user,
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
