// ============================================
// ROUTE HANDLER (CONTROLADOR): /api/posts/[id]
// ============================================
// RUTA DINÁMICA en la API. El [id] es un parámetro.
// Define tres endpoints:
//   GET    /api/posts/123 → Obtener un post
//   PUT    /api/posts/123 → Actualizar un post
//   DELETE /api/posts/123 → Eliminar un post
//
// Equivalente a métodos show(), update(), destroy() en un Controller

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

// ============================================
// GET /api/posts/[id] → Obtener un post por ID
// ============================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    if (isNaN(postId)) {
      return NextResponse.json(
        { error: 'ID no válido' },
        { status: 400 }
      );
    }

    // Prisma: findUnique = SELECT * FROM posts WHERE id = ? LIMIT 1
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { name: true, email: true } } },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);

  } catch (error) {
    console.error('Error obteniendo post:', error);
    return NextResponse.json(
      { error: 'Error interno' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT /api/posts/[id] → Actualizar un post
// ============================================
// Solo el autor o un admin pueden editar un post
export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    // Verificar que el post existe
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    // Verificar permisos: solo el autor o admin pueden editar
    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este post' },
        { status: 403 }
      );
    }

    // Leer datos de actualización
    const body = await request.json();
    const { title, content, published, image } = body;

    // Prisma: update = UPDATE posts SET ... WHERE id = ?
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(published !== undefined && { published }),
        ...(image !== undefined && { image }),
      },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json(updatedPost);

  } catch (error) {
    console.error('Error actualizando post:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el post' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE /api/posts/[id] → Eliminar un post
// ============================================
// Solo el autor o un admin pueden eliminar un post
export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id);

    // Verificar que el post existe
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post no encontrado' }, { status: 404 });
    }

    // Verificar permisos
    if (existingPost.authorId !== user.id && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este post' },
        { status: 403 }
      );
    }

    // Prisma: delete = DELETE FROM posts WHERE id = ?
    await prisma.post.delete({ where: { id: postId } });

    return NextResponse.json({ message: 'Post eliminado correctamente' });

  } catch (error) {
    console.error('Error eliminando post:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el post' },
      { status: 500 }
    );
  }
}
