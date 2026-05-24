// ============================================
// ROUTE HANDLER (CONTROLADOR): /api/admin/users/[id]
// ============================================
// Endpoints de administración de usuarios.
// Solo accesibles por usuarios con rol "admin".
//
//   PUT    /api/admin/users/5 → Editar nombre, email y/o rol
//   DELETE /api/admin/users/5 → Eliminar usuario y sus posts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { getCurrentUser } from '@/lib/session';

const VALID_ROLES = ['user', 'editor', 'admin'];

// ============================================
// PUT /api/admin/users/[id] → Editar usuario
// ============================================
export async function PUT(request, { params }) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID no válido' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, role, password } = body;

    // Validar rol si viene
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: `Rol no válido. Usa: ${VALID_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar email si viene
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email) || email.length > 255) {
        return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
      }
      // Verificar que el email no lo use otro usuario
      const conflict = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (conflict) {
        return NextResponse.json({ error: 'El email ya está en uso' }, { status: 409 });
      }
    }

    if (name !== undefined && name.length > 100) {
      return NextResponse.json({ error: 'El nombre no puede superar 100 caracteres' }, { status: 400 });
    }

    if (password !== undefined && (password.length < 6 || password.length > 100)) {
      return NextResponse.json(
        { error: 'La contraseña debe tener entre 6 y 100 caracteres' },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Construir objeto de actualización solo con los campos enviados
    const data = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(password !== undefined && { password: await hashPassword(password) }),
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// ============================================
// DELETE /api/admin/users/[id] → Eliminar usuario
// ============================================
export async function DELETE(request, { params }) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'ID no válido' }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Eliminar posts del usuario primero (FK constraint)
    await prisma.post.deleteMany({ where: { authorId: userId } });
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ message: 'Usuario eliminado correctamente' });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
