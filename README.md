# Blog MVC Tutorial - Next.js + Prisma + MySQL + Docker

Tutorial completo de desarrollo web MVC con Next.js 14, Prisma ORM y MySQL.
La base de datos MySQL se levanta con Docker, sin necesidad de instalar XAMPP ni MySQL manualmente.

---

## Requisitos previos

Necesitas tener instalados estos dos programas en tu máquina:

- **Node.js 18+** → [https://nodejs.org/](https://nodejs.org/) (verifica con `node -v`)
- **Docker Desktop** → [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/) (verifica con `docker --version`)

Asegúrate de que Docker Desktop esté **abierto y corriendo** antes de seguir los pasos.

---

## Instalación paso a paso

### 1. Instalar dependencias de Node.js

```bash
cd nextjs-mvc-tutorial
npm install
```

### 2. Configurar las variables de entorno

```bash
cp .env.example .env
```

No necesitas cambiar nada en el `.env` si usas Docker con la configuración por defecto. Los valores ya coinciden con los de `docker-compose.yml`.

### 3. Levantar MySQL con Docker

```bash
docker compose up -d
```

Esto descarga la imagen de MySQL 8 (solo la primera vez) y levanta dos servicios:

- **MySQL** en `localhost:3306` (la base de datos)
- **phpMyAdmin** en `http://localhost:8080` (interfaz web para ver la BD)

Para verificar que MySQL está listo:

```bash
docker compose ps
```

Deberías ver los dos contenedores con estado `running (healthy)`.

### 4. Crear las tablas (migración de Prisma)

```bash
npx prisma migrate dev --name init
```

Esto lee el archivo `prisma/schema.prisma`, genera el SQL necesario (CREATE TABLE) y lo ejecuta contra tu MySQL en Docker. Verás un mensaje confirmando que la migración se aplicó correctamente.

### 5. Poblar la base de datos con datos de ejemplo

```bash
node prisma/seed.js
```

Esto crea 3 usuarios con distintos roles y 3 posts de ejemplo. Verás las credenciales en la consola.

### 6. Arrancar la aplicación

```bash
npm run dev
```

Abre **http://localhost:3000** en tu navegador. La aplicación debería mostrar la página de inicio con los posts de ejemplo.

---

## Cuentas de prueba

| Email               | Contraseña | Rol     | Permisos                        |
|---------------------|------------|---------|----------------------------------|
| admin@example.com   | admin123   | admin   | Todo: CRUD posts + panel admin   |
| editor@example.com  | editor123  | editor  | Crear y editar sus propios posts |
| user@example.com    | user123    | user    | Solo ver contenido público       |

---

## Comandos útiles

### Docker

```bash
docker compose up -d          # Levantar MySQL y phpMyAdmin
docker compose down            # Parar los contenedores (datos se mantienen)
docker compose down -v         # Parar y BORRAR todos los datos de la BD
docker compose logs mysql      # Ver los logs de MySQL
docker compose ps              # Ver el estado de los contenedores
```

### Prisma

```bash
npx prisma migrate dev --name nombre   # Crear y aplicar una migración
npx prisma studio                      # Abrir interfaz web para ver la BD
npx prisma generate                    # Regenerar el cliente de Prisma
node prisma/seed.js                    # Recargar datos de ejemplo
```

### Next.js

```bash
npm run dev       # Servidor de desarrollo (http://localhost:3000)
npm run build     # Compilar para producción
npm run start     # Arrancar en modo producción
```

---

## Acceder a la base de datos visualmente

Tienes dos opciones para ver los datos de MySQL de forma visual:

**phpMyAdmin** (incluido en Docker): abre `http://localhost:8080` en tu navegador. Entra con usuario `root` y contraseña `root1234`. Desde ahí puedes ver todas las tablas, ejecutar consultas SQL y gestionar los datos.

**Prisma Studio**: ejecuta `npx prisma studio` en una terminal separada. Se abrirá automáticamente `http://localhost:5555` con una interfaz moderna para navegar por tus modelos y datos. Es más limpio que phpMyAdmin para trabajar con los modelos de Prisma.

---

## Estructura del proyecto

```
nextjs-mvc-tutorial/
├── docker-compose.yml          # Docker: MySQL + phpMyAdmin
├── .env                         # Variables de entorno (no se sube a git)
├── .env.example                 # Plantilla del .env (sí se sube a git)
├── package.json
├── next.config.js
├── middleware.js                 # Control de acceso por roles
│
├── prisma/
│   ├── schema.prisma            # Modelos de la BD (User, Post)
│   └── seed.js                  # Datos de ejemplo
│
├── lib/
│   ├── prisma.js                # Cliente Prisma (singleton)
│   ├── session.js               # Configuración de sesiones
│   └── auth.js                  # Funciones de autenticación
│
├── components/
│   ├── Navbar.jsx               # Barra de navegación
│   ├── CookieBanner.jsx         # Banner de cookies
│   └── DeletePostButton.jsx     # Botón eliminar post
│
├── app/
│   ├── layout.jsx               # Layout base (plantilla maestra)
│   ├── page.jsx                 # Página inicio /
│   ├── error.jsx                # Página de error global
│   ├── not-found.jsx            # Página 404
│   ├── globals.css
│   ├── about/page.jsx           # /about
│   ├── contact/page.jsx         # /contact (formulario con Server Action)
│   ├── posts/
│   │   ├── page.jsx             # /posts
│   │   └── [id]/page.jsx        # /posts/:id (ruta dinámica)
│   ├── auth/
│   │   ├── login/page.jsx       # /auth/login
│   │   └── register/page.jsx    # /auth/register
│   ├── dashboard/
│   │   ├── page.jsx             # /dashboard (protegido)
│   │   ├── posts/
│   │   │   ├── new/page.jsx     # Crear post + subida de archivos
│   │   │   └── [id]/edit/page.jsx
│   │   └── admin/page.jsx       # Solo rol admin
│   └── api/                     # CONTROLADORES (Route Handlers)
│       ├── posts/
│       │   ├── route.js         # GET + POST
│       │   └── [id]/route.js    # GET + PUT + DELETE
│       ├── auth/
│       │   ├── login/route.js
│       │   ├── register/route.js
│       │   └── logout/route.js
│       ├── upload/route.js      # Subida de archivos
│       └── cookies/route.js     # Gestión de cookies
│
└── public/uploads/              # Imágenes subidas
```

---

## Tecnologías

- **Next.js 14** — Framework React fullstack con App Router
- **Prisma** — ORM (modelos, migraciones, consultas)
- **MySQL 8** — Base de datos relacional (via Docker)
- **Docker** — Contenedores para MySQL y phpMyAdmin
- **iron-session** — Sesiones con cookies cifradas
- **bcryptjs** — Hash seguro de contraseñas

---