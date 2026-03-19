// ============================================
// PÁGINA: Login → RUTA ESTÁTICA: /auth/login
// ============================================
// Demuestra: Formulario HTML que envía datos a un endpoint POST
// Este es un CLIENT COMPONENT porque necesitamos:
// - useState para manejar errores
// - fetch() para enviar datos al API
// - Router para redirigir después del login

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Estado para manejar errores y loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // URL a la que redirigir tras login exitoso
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // ============================================
  // Handler: Enviar formulario de login
  // ============================================
  // Enviamos los datos a nuestro Route Handler POST /api/auth/login
  // Es equivalente a enviar un formulario a un controlador en MVC
  async function handleSubmit(e) {
    e.preventDefault(); // Prevenir recarga de la página
    setError('');
    setLoading(true);

    // Extraer datos del formulario
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      // ---- Petición POST al endpoint de login ----
      // Es equivalente a: POST /api/auth/login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Error del servidor (credenciales incorrectas, etc.)
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // ---- Login exitoso → Redirigir ----
      // router.push() es equivalente a redirect() en PHP
      router.push(redirectUrl);
      router.refresh(); // Refrescar para que el Navbar se actualice
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <h1>Iniciar Sesión</h1>

      {/* ---- Mensaje de error ---- */}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* ---- Mensaje si viene de una redirección ---- */}
      {searchParams.get('redirect') && (
        <div className="alert alert-warning">
          Necesitas iniciar sesión para acceder a esa página.
        </div>
      )}

      {/* ---- Formulario de Login ---- */}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="tu@email.com"
            defaultValue="admin@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder="Tu contraseña"
            defaultValue="admin123"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      {/* ---- Link a registro ---- */}
      <p className="mt-2 text-center" style={{ color: '#6b7280' }}>
        ¿No tienes cuenta?{' '}
        <Link href="/auth/register">Regístrate aquí</Link>
      </p>

      {/* ---- Info de prueba ---- */}
      <div className="alert alert-warning" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
        <strong>Cuentas de prueba:</strong><br />
        admin@example.com / admin123 (Admin)<br />
        editor@example.com / editor123 (Editor)<br />
        user@example.com / user123 (Usuario)
      </div>
    </div>
  );
}
