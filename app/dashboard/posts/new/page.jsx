// ============================================
// PÁGINA: Nuevo Post → RUTA PROTEGIDA: /dashboard/posts/new
// ============================================
// Demuestra:
// - Gestión de formularios HTML con múltiples campos
// - Subida de archivos al servidor (imagen del post)
// - Envío de datos a un endpoint API
// - Redirección tras éxito
//
// El middleware protege esta ruta: solo editor y admin pueden acceder

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewPostPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');

  // ============================================
  // Handler: Subir imagen al servidor
  // ============================================
  // Se ejecuta cuando el usuario selecciona un archivo
  // Envía el archivo a POST /api/upload via FormData
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local (para mostrar antes de subir)
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    // ---- Crear FormData para enviar el archivo ----
    // FormData es la forma estándar de enviar archivos via HTTP
    // El navegador automáticamente pone Content-Type: multipart/form-data
    const formData = new FormData();
    formData.append('file', file); // 'file' debe coincidir con formData.get('file') en el API

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData, // NO poner Content-Type header, FormData lo gestiona
      });

      const data = await response.json();

      if (response.ok) {
        setUploadedImageUrl(data.url); // URL pública de la imagen
      } else {
        setError(data.error || 'Error al subir la imagen');
      }
    } catch (err) {
      setError('Error al subir la imagen');
    }
  }

  // ============================================
  // Handler: Enviar formulario de nuevo post
  // ============================================
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.target);

    try {
      // Enviar datos como JSON al endpoint de posts
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          content: formData.get('content'),
          published: formData.get('published') === 'on',
          image: uploadedImageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear el post');
        return;
      }

      // Éxito → Redirigir al dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container" style={{ maxWidth: '700px' }}>
      <div className="flex-between mb-2">
        <h1>Crear Nuevo Post</h1>
        <Link href="/dashboard">← Volver</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* ---- Campo: Título ---- */}
        <div className="form-group">
          <label htmlFor="title">Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="Título del post"
          />
        </div>

        {/* ---- Campo: Contenido ---- */}
        <div className="form-group">
          <label htmlFor="content">Contenido *</label>
          <textarea
            id="content"
            name="content"
            required
            placeholder="Escribe el contenido del post..."
            style={{ minHeight: '200px' }}
          />
        </div>

        {/* ---- Campo: Imagen (Subida de archivo) ---- */}
        {/* ESTE ES EL INPUT DE SUBIDA DE ARCHIVOS */}
        <div className="form-group">
          <label htmlFor="image">Imagen del post (opcional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageUpload}
          />
          <small style={{ color: '#6b7280' }}>
            Formatos: JPEG, PNG, GIF, WebP. Máximo: 5MB
          </small>

          {/* Preview de la imagen subida */}
          {imagePreview && (
            <div style={{ marginTop: '0.5rem' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
              {uploadedImageUrl && (
                <p style={{ color: '#16a34a', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  ✅ Imagen subida correctamente
                </p>
              )}
            </div>
          )}
        </div>

        {/* ---- Campo: Publicar (checkbox) ---- */}
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="published" style={{ width: 'auto' }} />
            Publicar inmediatamente
          </label>
          <small style={{ color: '#6b7280' }}>
            Si no marcas esta opción, el post se guardará como borrador.
          </small>
        </div>

        {/* ---- Botón de enviar ---- */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Creando post...' : 'Crear Post'}
        </button>
      </form>
    </div>
  );
}
