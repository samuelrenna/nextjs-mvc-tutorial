// ============================================
// ROUTE HANDLER (CONTROLADOR): /api/posts
// ============================================
// Este archivo define DOS endpoints en la misma URL:
//   GET  /api/posts → Listar posts (público)
//   POST /api/posts → Crear post (requiere autenticación)
//
// Es equivalente a un PostController con métodos index() y store()

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { generateSlug } from '@/lib/auth';

// ============================================
// GET /api/posts → Listar todos los posts
// ============================================
// Endpoint público. Retorna posts publicados con paginación básica.
// Query params opcionales: ?page=1&limit=10&search=texto
export async function GET(request) {
  try {
    // Leer query params de la URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Construir filtro WHERE
    const where = {
      published: true,
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ],
      }),
    };

    // Consulta con paginación (skip + take = OFFSET + LIMIT)
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit, // OFFSET
        take: limit,               // LIMIT
      }),
      prisma.post.count({ where }), // COUNT para la paginación
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error listando posts:', error);
    return NextResponse.json(
      { error: 'Error al obtener posts' },
      { status: 500 }
    );
  }
}

// ============================================
// POST /api/posts → Crear un nuevo post
// ============================================
// Requiere estar logueado (con rol editor o admin).
// Recibe: { title, content, published }
export async function POST(request) {
  try {
    // 1. Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // 2. Verificar permisos (solo editor o admin pueden crear posts)
    if (!['editor', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear posts' },
        { status: 403 } // 403 Forbidden
      );
    }

    // 3. Leer datos del body
    const body = await request.json();
    const { title, content, published = false } = body;

    // 4. Validar campos obligatorios
    if (!title || !content) {
      return NextResponse.json(
        { error: 'El título y contenido son obligatorios' },
        { status: 400 }
      );
    }

    // 5. Generar slug único a partir del título
    let slug = generateSlug(title);
    // Verificar que el slug no exista ya
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (existingPost) {
      slug = `${slug}-${Date.now()}`; // Añadir timestamp si ya existe
    }

    // 6. Crear post en la base de datos
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        published: published === true || published === 'true',
        authorId: user.id, // Relación con el usuario logueado
      },
      include: { author: { select: { name: true } } },
    });

    // 7. Responder con el post creado (201 Created)
    return NextResponse.json(post, { status: 201 });

  } catch (error) {
    console.error('Error creando post:', error);
    return NextResponse.json(
      { error: 'Error al crear el post' },
      { status: 500 }
    );
  }
}
