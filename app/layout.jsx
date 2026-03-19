// ============================================
// LAYOUT PRINCIPAL (layout.jsx)
// ============================================
// Este archivo es el EQUIVALENTE a una "plantilla base"
// en un motor de plantillas como Blade.
//
// En MVC tradicional sería: layout.blade.php
// En Next.js, el layout envuelve TODAS las páginas hijas.
//
// Las páginas individuales se renderizan donde aparece {children}


import './globals.css';
import Navbar from '@/components/Navbar';
import CookieBanner from '@/components/CookieBanner';

// ---- Metadata global (equivalente al <head> en la plantilla base) ----
export const metadata = {
  title: {
    default: 'MVC Blog Tutorial',
    template: '%s | MVC Blog', // Las páginas hijas pueden sobreescribir el título
  },
  description: 'Tutorial de desarrollo MVC con Next.js, Prisma y MySQL',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* ---- Navbar global (aparece en todas las páginas) ---- */}
        <Navbar />

        {/* ---- Contenido principal ---- */}
        {/* Aquí se renderiza cada página (page.jsx) */}
        {/* Es equivalente a {% block content %}{% endblock %} */}
        <main className="container">
          {children}
        </main>

        {/* ---- Footer global ---- */}
        <footer style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.85rem' }}>
          <p>MVC Blog Tutorial © 2025 - Hecho con Next.js + Prisma + MySQL</p>
        </footer>

        {/* ---- Banner de Cookies ---- */}
        <CookieBanner />
      </body>
    </html>
  );
}
