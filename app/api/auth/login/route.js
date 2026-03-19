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

export async function POST(request) {
  try {
    // ---- 1. Leer el body de la petición (datos del formulario) ----
    // request.json() parsea el body JSON
    // Equivalente a: $data = json_decode($request->getContent(), true);
    const { email, password } = await request.json();

    // ---- 2. Validar que se enviaron los datos ----
    if (!email || !password) {
      // Retornamos error 400 (Bad Request)
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
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
