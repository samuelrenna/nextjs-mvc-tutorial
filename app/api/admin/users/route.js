// ============================================
// ROUTE HANDLER (CONTROLADOR): POST /api/admin/users
// ============================================
// Crear un nuevo usuario desde el panel de administración.
// Solo accesible por usuarios con rol "admin".
//
// Body: { name, email, password, role }

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

const VALID_ROLES = ['user', 'editor', 'admin'];

export async function POST(request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role = 'user' } = body;

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son obligatorios' },
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
      return NextResponse.json(
        { error: 'La contraseña debe tener entre 6 y 100 caracteres' },
        { status: 400 }
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Rol no válido. Usa: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(user, { status: 201 });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
