// ============================================
// PÁGINA: Editar Post → RUTA DINÁMICA PROTEGIDA:
//         /dashboard/posts/[id]/edit
// ============================================
// Combina: Ruta dinámica + protección + formulario + API

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // null  = sin cambios (se mantiene la imagen actual)
  // ''    = se elimina la imagen (enviar null al API)
  // '/uploads/...' = imagen nueva subida
  const [imageChange, setImageChange] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ---- Cargar los datos del post al montar el componente ----
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) throw new Error('Post no encontrado');
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError('No se pudo cargar el post');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [postId]);

  // ---- Subir nueva imagen ----
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok) {
        setImageChange(data.url); // URL pública de la nueva imagen
      } else {
        setError(data.error || 'Error al subir la imagen');
        setImagePreview(null);
      }
    } catch {
      setError('Error al subir la imagen');
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  }

  // ---- Eliminar imagen actual ----
  function handleRemoveImage() {
    setImageChange('');   // '' = eliminar
    setImagePreview(null);
  }

  // ---- Cancelar cambio de imagen ----
  function handleCancelImageChange() {
    setImageChange(null);
    setImagePreview(null);
  }

  // ---- Enviar actualización ----
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData(e.target);

    // Construir body: solo incluir image si cambió
    const body = {
      title: formData.get('title'),
      content: formData.get('content'),
      published: formData.get('published') === 'on',
    };

    if (imageChange !== null) {
      // '' → eliminar (null en DB); '/uploads/...' → nueva imagen
      body.image = imageChange === '' ? null : imageChange;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al actualizar');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center mt-4">Cargando...</div>;
  if (!post) return <div className="alert alert-error mt-4">{error || 'Post no encontrado'}</div>;

  // Imagen que se muestra actualmente (puede ser la original o la nueva preview)
  const currentImage = imageChange === '' ? null : (imagePreview || (imageChange ?? post.image));

  return (
    <div className="form-container" style={{ maxWidth: '700px' }}>
      <div className="flex-between mb-2">
        <h1>Editar Post</h1>
        <Link href="/dashboard">← Volver</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Título</label>
          <input type="text" id="title" name="title" required defaultValue={post.title} />
        </div>

        <div className="form-group">
          <label htmlFor="content">Contenido</label>
          <textarea
            id="content"
            name="content"
            required
            defaultValue={post.content}
            style={{ minHeight: '200px' }}
          />
        </div>

        {/* ---- Gestión de imagen ---- */}
        <div className="form-group">
          <label>Imagen del post</label>

          {currentImage ? (
            /* Hay imagen: mostrarla con opciones */
            <div>
              <img
                src={currentImage}
                alt="Imagen del post"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  display: 'block',
                  marginBottom: '0.75rem',
                }}
              />
              {imageChange !== null && imageChange !== '' && (
                <p style={{ color: '#16a34a', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  ✅ Nueva imagen lista para guardar
                </p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {/* Cambiar por otra imagen */}
                <label
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: uploading ? 'wait' : 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  {uploading ? 'Subiendo...' : 'Cambiar imagen'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>

                {/* Quitar imagen */}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Quitar imagen
                </button>

                {/* Cancelar cambio (solo si se cambió algo) */}
                {imageChange !== null && (
                  <button
                    type="button"
                    onClick={handleCancelImageChange}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: 'none',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: '#6b7280',
                    }}
                  >
                    Cancelar cambio
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Sin imagen: mostrar uploader */
            <div>
              {imageChange === '' && (
                <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  La imagen actual se eliminará al guardar.{' '}
                  <button
                    type="button"
                    onClick={handleCancelImageChange}
                    style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontSize: 'inherit' }}
                  >
                    Deshacer
                  </button>
                </p>
              )}
              <label
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  border: '1px dashed #d1d5db',
                  borderRadius: '6px',
                  cursor: uploading ? 'wait' : 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {uploading ? 'Subiendo...' : '+ Subir imagen'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
              <small style={{ display: 'block', color: '#9ca3af', marginTop: '0.35rem' }}>
                JPEG, PNG, GIF, WebP · máx. 5 MB
              </small>
            </div>
          )}
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="published" defaultChecked={post.published} style={{ width: 'auto' }} />
            Publicar
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving || uploading}
          style={{ width: '100%' }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
