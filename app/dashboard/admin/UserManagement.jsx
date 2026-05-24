'use client';

// ============================================
// COMPONENTE CLIENTE: Gestión completa de usuarios (admin)
// ============================================
// Maneja la tabla de usuarios con las acciones CRUD:
//   - Crear usuario (modal con nombre, email, contraseña, rol)
//   - Editar usuario (modal con nombre, email, rol, contraseña opcional)
//   - Eliminar usuario (confirmar antes de borrar)

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLES = ['user', 'editor', 'admin'];

const EMPTY_FORM = { name: '', email: '', password: '', role: 'user' };

// ---- Modal genérico ----
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'white', borderRadius: '8px', padding: '2rem',
        width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ---- Formulario reutilizado en Crear y Editar ----
function UserForm({ initial, onSubmit, loading, error, isEdit }) {
  const [form, setForm] = useState(initial);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label>Nombre</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          maxLength={100}
          placeholder="Nombre completo"
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          required
          maxLength={255}
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div className="form-group">
        <label>{isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          required={!isEdit}
          minLength={isEdit && form.password ? 6 : undefined}
          placeholder={isEdit ? '••••••  (opcional)' : 'Mínimo 6 caracteres'}
        />
      </div>

      <div className="form-group">
        <label>Rol</label>
        <select
          value={form.role}
          onChange={(e) => set('role', e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', width: '100%' }}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear usuario'}
      </button>
    </form>
  );
}

// ---- Componente principal ----
export default function UserManagement({ users: initialUsers, currentAdminId }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // ---- Crear usuario ----
  async function handleCreate(form) {
    setLoading(true);
    setFormError('');

    const body = { name: form.name, email: form.email, password: form.password, role: form.role };

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Error al crear usuario');
        return;
      }

      setUsers((prev) => [{ ...data, _count: { posts: 0 } }, ...prev]);
      setShowCreate(false);
      router.refresh();
    } catch {
      setFormError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  // ---- Editar usuario ----
  async function handleEdit(form) {
    setLoading(true);
    setFormError('');

    const body = {
      name: form.name,
      email: form.email,
      role: form.role,
      ...(form.password ? { password: form.password } : {}),
    };

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Error al actualizar usuario');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === data.id ? { ...u, ...data } : u))
      );
      setEditingUser(null);
      router.refresh();
    } catch {
      setFormError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  // ---- Eliminar usuario ----
  async function handleDelete(user) {
    if (!confirm(`¿Eliminar a "${user.name}" y todos sus posts? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al eliminar usuario');
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      router.refresh();
    } catch {
      alert('Error de conexión');
    }
  }

  return (
    <>
      {/* ---- Cabecera con botón Crear ---- */}
      <div className="flex-between mt-4" style={{ alignItems: 'center' }}>
        <h2>Usuarios Registrados</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setFormError(''); setShowCreate(true); }}
        >
          + Crear usuario
        </button>
      </div>

      {/* ---- Tabla de usuarios ---- */}
      <div className="table-wrapper mt-1">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Posts</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge badge-${u.role}`}>{u.role}</span>
                </td>
                <td>{u._count?.posts ?? 0}</td>
                <td>{new Date(u.createdAt).toLocaleDateString('es-ES')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => { setFormError(''); setEditingUser(u); }}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={u.id === currentAdminId}
                      title={u.id === currentAdminId ? 'No puedes eliminar tu propia cuenta' : `Eliminar ${u.name}`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: '0.85rem',
                        background: u.id === currentAdminId ? '#9ca3af' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: u.id === currentAdminId ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---- Modal: Crear usuario ---- */}
      {showCreate && (
        <Modal title="Crear usuario" onClose={() => setShowCreate(false)}>
          <UserForm
            initial={EMPTY_FORM}
            onSubmit={handleCreate}
            loading={loading}
            error={formError}
            isEdit={false}
          />
        </Modal>
      )}

      {/* ---- Modal: Editar usuario ---- */}
      {editingUser && (
        <Modal title={`Editar: ${editingUser.name}`} onClose={() => setEditingUser(null)}>
          <UserForm
            initial={{ name: editingUser.name, email: editingUser.email, password: '', role: editingUser.role }}
            onSubmit={handleEdit}
            loading={loading}
            error={formError}
            isEdit={true}
          />
        </Modal>
      )}
    </>
  );
}
