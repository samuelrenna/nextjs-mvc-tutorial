# Blog MVC Tutorial — Next.js + Prisma + MySQL + Docker

Tutorial de desarrollo web MVC con Next.js 14, Prisma ORM y MySQL. Todo el stack corre con Docker.

---

## Requisitos

- **Docker Desktop** corriendo → [docker.com](https://www.docker.com/products/docker-desktop/)

---

## Puesta en marcha

```bash
# 1. Levantar todo (app + MySQL + phpMyAdmin)
docker compose up -d

# 2. Poblar la base de datos con usuarios y posts de ejemplo
node prisma/seed.js
```

Abre **http://localhost:3000** — ya funciona.

---

## URLs

- App → <http://localhost:3000>
- phpMyAdmin → <http://localhost:8080>

---

## Cuentas de prueba

| Email               | Contraseña | Rol     |
|---------------------|------------|---------|
| admin@example.com   | admin123   | admin   |
| editor@example.com  | editor123  | editor  |
| user@example.com    | user123    | user    |

---

## Comandos útiles

```bash
# Docker
docker compose up -d          # Levantar todo
docker compose down            # Parar (datos se mantienen)
docker compose down -v         # Parar y borrar datos
docker compose logs app        # Ver logs de la app
docker compose logs mysql      # Ver logs de MySQL

# Prisma
node prisma/seed.js            # Recargar datos de ejemplo
npx prisma studio              # Abrir UI de la BD (localhost:5555)
npx prisma migrate dev         # Crear y aplicar migraciones
```

---

## Estructura

```
nextjs-mvc-tutorial/
├── docker-compose.yml          # App + MySQL + phpMyAdmin
├── Dockerfile                  # Imagen de la app Next.js
├── middleware.js               # Control de acceso por roles
├── prisma/
│   ├── schema.prisma           # Modelos User y Post
│   └── seed.js                 # Datos de ejemplo
├── lib/
│   ├── prisma.js               # Cliente Prisma
│   ├── session.js              # Sesiones con cookies cifradas
│   └── auth.js                 # Autenticación con bcrypt
├── components/
│   ├── Navbar.jsx
│   ├── CookieBanner.jsx
│   └── DeletePostButton.jsx
└── app/
    ├── layout.jsx              # Plantilla base
    ├── page.jsx                # / (home)
    ├── not-found.jsx           # 404
    ├── error.jsx               # Errores de runtime
    ├── about/                  # /about
    ├── contact/                # /contact (Server Action)
    ├── posts/[id]/             # /posts/:id (ruta dinámica)
    ├── auth/                   # /auth/login y /auth/register
    ├── dashboard/              # Rutas protegidas por rol
    └── api/                    # Controladores REST
        ├── posts/              # CRUD de posts
        ├── auth/               # login, register, logout
        ├── upload/             # Subida de imágenes
        └── cookies/            # Preferencias de cookies
```

---

## Tecnologías

**Next.js 14** · **Prisma** · **MySQL 8** · **Docker** · **iron-session** · **bcryptjs**
