// ============================================
// ROUTE HANDLER (CONTROLADOR): POST /api/auth/register
// ============================================
// Endpoint para registrar nuevos usuarios.
// Valida datos → Crea usuario en BD → Inicia sesión automática
//
// URL: POST /api/auth/register
// Body: { name, email, password }

import { NextResponse } from 'next/server';
import { registerUser } from '@/lib/auth';
import { getSession } from '@/lib/session';

export async function POST(request) {
  try {
    // 1. Leer datos del body
    const { name, email, password } = await request.json();

    // 2. Validación
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'El nombre no puede superar 100 caracteres' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 255) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
    }

    if (password.length < 6 || password.length > 100) {
      return NextResponse.json({ error: 'La contraseña debe tener entre 6 y 100 caracteres' }, { status: 400 });
    }

    // 3. Registrar usuario (hashea contraseña y guarda en BD)
    const user = await registerUser({ name, email, password });

    // 4. Iniciar sesión automáticamente tras el registro
    const session = await getSession();
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    await session.save();

    // 5. Responder con éxito (201 Created)
    return NextResponse.json(
      { message: 'Registro exitoso', user: session.user },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    
    // Errores conocidos (email duplicado, validación, etc.)
    if (error.message) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
