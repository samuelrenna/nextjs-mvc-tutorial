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

  // ---- Enviar actualización ----
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const formData = new FormData(e.target);

    try {
      // PUT al endpoint dinámico /api/posts/[id]
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          content: formData.get('content'),
          published: formData.get('published') === 'on',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al actualizar');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center mt-4">Cargando...</div>;
  if (!post) return <div className="alert alert-error mt-4">{error || 'Post no encontrado'}</div>;

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
          <textarea id="content" name="content" required defaultValue={post.content} style={{ minHeight: '200px' }} />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" name="published" defaultChecked={post.published} style={{ width: 'auto' }} />
            Publicar
          </label>
        </div>

        {post.image && (
          <div className="form-group">
            <label>Imagen actual</label>
            <img src={post.image} alt="Post" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%' }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
