// ============================================
// PÁGINA: Error Global → error.jsx
// ============================================
// Next.js busca este archivo automáticamente cuando ocurre
// un error no manejado en cualquier página o layout.
//
// Es un CLIENT COMPONENT (obligatorio para error.jsx)
// porque Next.js necesita poder re-renderizar sin perder estado.
//
// Equivalente en MVC: ErrorController o página de error personalizada
// En Laravel: app/Exceptions/Handler.php

'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }) {
  // 'error' → el objeto Error que ocurrió
  // 'reset' → función para intentar re-renderizar el segmento

  useEffect(() => {
    // Logear el error (en producción enviarías a un servicio como Sentry)
    console.error('❌ Error capturado:', error);
  }, [error]);

  return (
    <div className="text-center" style={{ padding: '4rem 0' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️ ¡Algo salió mal!</h1>
      <p style={{ color: '#6b7280', marginBottom: '1rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
        Ha ocurrido un error inesperado. Puedes intentar recargar o volver al inicio.
      </p>

      {/* Mostrar detalle del error en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="alert alert-error" style={{ maxWidth: '600px', margin: '0 auto 1.5rem', textAlign: 'left' }}>
          <strong>Error:</strong> {error.message}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        {/* reset() vuelve a intentar renderizar la página */}
        <button onClick={() => reset()} className="btn btn-primary">
          Intentar de nuevo
        </button>
        <Link href="/" className="btn btn-outline">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
