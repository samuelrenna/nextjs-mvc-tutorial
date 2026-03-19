// ============================================
// COMPONENTE: CookieBanner (Banner de Cookies)
// ============================================
// Este es un CLIENT COMPONENT (usa "use client")
// porque necesita interactividad: leer/escribir cookies
// desde el navegador y gestionar estado con useState.
//
// Demuestra: Gestión de cookies desde el lado del cliente

'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Al cargar, verificar si ya aceptó las cookies
    // Leemos la cookie directamente desde document.cookie
    const cookieConsent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookie_consent='));
    
    // Si no existe la cookie de consentimiento, mostrar el banner
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  // ---- Función para aceptar cookies ----
  const acceptCookies = async () => {
    // Opción 1: Escribir cookie desde el cliente
    // Formato: nombre=valor; max-age=segundos; path=/
    document.cookie = 'cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax';
    
    // Opción 2: También podemos usar nuestro endpoint API
    // para guardar preferencias más complejas en el servidor
    await fetch('/api/cookies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analytics: true,
        marketing: false,
        preferences: true,
      }),
    });

    setShowBanner(false);
  };

  // ---- Función para rechazar cookies opcionales ----
  const rejectCookies = () => {
    // Guardamos que rechazó (esta cookie sí es necesaria)
    document.cookie = 'cookie_consent=rejected; max-age=31536000; path=/; SameSite=Lax';
    setShowBanner(false);
  };

  // Si no hay que mostrar, no renderizar nada
  if (!showBanner) return null;

  return (
    <div className="cookie-banner">
      <p>
        🍪 Este sitio usa cookies para mejorar tu experiencia. 
        Puedes aceptar todas o solo las esenciales.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={rejectCookies} className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }}>
          Solo esenciales
        </button>
        <button onClick={acceptCookies} className="btn btn-primary">
          Aceptar todas
        </button>
      </div>
    </div>
  );
}
