// ============================================
// COMPONENTE: DeletePostButton (Client Component)
// ============================================
// Botón para eliminar un post con confirmación.
// Es un Client Component porque necesita onClick y fetch().

'use client';

import { useRouter } from 'next/navigation';

export default function DeletePostButton({ postId }) {
  const router = useRouter();

  async function handleDelete() {
    // Pedir confirmación
    if (!confirm('¿Estás seguro de que quieres eliminar este post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refrescar la página para actualizar la lista
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Error al eliminar');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  }

  return (
    <button onClick={handleDelete} className="btn btn-danger btn-sm">
      Eliminar
    </button>
  );
}
