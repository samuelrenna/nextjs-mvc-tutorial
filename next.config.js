/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir imágenes subidas desde el directorio público
  images: {
    remotePatterns: [],
  },
  // Configuración experimental para Server Actions (formularios)
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // Límite para subida de archivos
    },
  },
};

module.exports = nextConfig;
