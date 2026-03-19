// ============================================
// ROUTE HANDLER (CONTROLADOR): POST /api/upload
// ============================================
// Endpoint para SUBIDA DE ARCHIVOS al servidor.
// Recibe un archivo vía FormData y lo guarda en /public/uploads/
//
// Demuestra: Gestión de formularios HTML para subida de archivos
//
// IMPORTANTE: En producción, usarías un servicio como S3, Cloudinary,
// o similar. Guardar archivos en /public/ es solo para el tutorial.

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    // 1. Verificar autenticación
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Leer el FormData de la petición
    // El navegador envía el archivo como multipart/form-data
    // request.formData() lo parsea automáticamente
    const formData = await request.formData();
    
    // 3. Obtener el archivo del FormData
    // 'file' es el name="" del input file en el formulario
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha enviado ningún archivo' },
        { status: 400 }
      );
    }

    // 4. Validar tipo de archivo (solo imágenes)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      );
    }

    // 5. Validar tamaño (máx. 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'El archivo no puede superar los 5MB' },
        { status: 400 }
      );
    }

    // 6. Generar nombre único para el archivo
    // Usamos timestamp + nombre original para evitar colisiones
    const extension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${extension}`;

    // 7. Asegurar que el directorio de uploads existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 8. Convertir el archivo a Buffer y escribirlo en disco
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 9. Retornar la URL pública del archivo
    // Los archivos en /public/ son accesibles directamente por URL
    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      message: 'Archivo subido correctamente',
      url: publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });

  } catch (error) {
    console.error('Error subiendo archivo:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo' },
      { status: 500 }
    );
  }
}
