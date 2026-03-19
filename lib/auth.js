// ============================================
// LIB: Funciones auxiliares de Autenticación
// ============================================
// Aquí centralizamos la lógica de auth:
// - Hash de contraseñas con bcrypt
// - Validación de credenciales
// - Creación de usuarios

import bcrypt from 'bcryptjs';
import prisma from './prisma';

// ============================================
// hashPassword(): Hashear una contraseña
// ============================================
// bcrypt genera un hash irreversible con "salt" incluido
// El número 10 es el "salt rounds" (cuántas veces se aplica)
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// ============================================
// verifyPassword(): Comparar contraseña con hash
// ============================================
// bcrypt.compare() extrae el salt del hash almacenado
// y re-hashea la contraseña para compararlas
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// ============================================
// registerUser(): Registrar un nuevo usuario
// ============================================
// 1. Valida que el email no exista ya
// 2. Hashea la contraseña
// 3. Crea el usuario en la BD
export async function registerUser({ email, name, password }) {
  // Verificar si el email ya está registrado
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('El email ya está registrado');
  }

  // Validaciones básicas
  if (!email || !name || !password) {
    throw new Error('Todos los campos son obligatorios');
  }

  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }

  // Crear usuario con contraseña hasheada
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'user', // Por defecto, rol "user"
    },
  });

  // Retornamos sin la contraseña por seguridad
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// ============================================
// authenticateUser(): Verificar credenciales de login
// ============================================
// 1. Busca el usuario por email
// 2. Compara la contraseña proporcionada con el hash
// 3. Retorna el usuario (sin contraseña) o null
export async function authenticateUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return null; // Usuario no encontrado
  }

  const isValid = await verifyPassword(password, user.password);
  
  if (!isValid) {
    return null; // Contraseña incorrecta
  }

  // Retornamos sin la contraseña
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// ============================================
// Helpers para generar slugs a partir del título
// ============================================
export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')                    // Descomponer acentos
    .replace(/[\u0300-\u036f]/g, '')     // Eliminar marcas diacríticas
    .replace(/[^a-z0-9]+/g, '-')         // Reemplazar caracteres especiales por guión
    .replace(/^-+|-+$/g, '')             // Quitar guiones del inicio/final
    .substring(0, 100);                  // Limitar longitud
}
