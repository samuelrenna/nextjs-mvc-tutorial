// ============================================
// PÁGINA: Not Found → not-found.jsx
// ============================================
// Next.js renderiza esta página cuando:
// 1. Se llama a notFound() desde cualquier Server Component
// 2. Una ruta no coincide con ninguna página existente
//
// Es equivalente a la página 404 personalizada en otros frameworks.
// En Laravel: resources/views/errors/404.blade.php

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="text-center" style={{ padding: '4rem 0' }}>
      <h1 style={{ fontSize: '6rem', fontWeight: '800', color: '#e5e7eb' }}>404</h1>
      <h2 style={{ marginBottom: '1rem' }}>Página no encontrada</h2>
      <p style={{ color: '#6b7280', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
        La página que buscas no existe o ha sido movida a otra dirección.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">
          Ir al inicio
        </Link>
        <Link href="/posts" className="btn btn-outline">
          Ver posts
        </Link>
      </div>
    </div>
  );
}
