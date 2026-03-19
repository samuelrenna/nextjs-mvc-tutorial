// ============================================
// PÁGINA: Contact → RUTA ESTÁTICA: /contact
// ============================================
// Demuestra: Gestión de formularios HTML desde un controlador
// Usa Server Actions (funciones "use server") para procesar
// el formulario directamente sin necesidad de un endpoint API.
//
// Server Actions son funciones que se ejecutan en el servidor
// cuando el usuario envía un formulario. Next.js las conecta
// automáticamente con el formulario mediante el atributo "action".

import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Contacto',
};

// ============================================
// SERVER ACTION: Procesar formulario de contacto
// ============================================
// Esta función se ejecuta en el SERVIDOR cuando se envía el form.
// Recibe un objeto FormData con los datos del formulario.
// Es equivalente a un controlador POST en MVC tradicional:
//   public function contact(Request $request) { ... }
async function handleContact(formData) {
  'use server'; // ← Indica que esta función se ejecuta en el servidor

  // Extraer datos del formulario
  // formData.get() 
  const name = formData.get('name');
  const email = formData.get('email');
  const subject = formData.get('subject');
  const message = formData.get('message');

  // ---- Validación del lado del servidor ----
  if (!name || !email || !message) {
    // En un Server Action, no podemos retornar errores directamente
    // Opciones: usar redirect con query params o useFormState
    redirect('/contact?error=campos-obligatorios');
  }

  // ---- Aquí procesarías el mensaje ----
  // Ejemplos: enviar email, guardar en BD, enviar a Slack, etc.
  console.log('📧 Nuevo mensaje de contacto:', { name, email, subject, message });

  // ---- Redirección tras éxito ----
  // Equivalente a return $this->redirect('/contact?success=1') en Symfony
  redirect('/contact?success=true');
}

export default function ContactPage({ searchParams }) {
  // searchParams contiene los query params de la URL
  // Ejemplo: /contact?success=true → searchParams.success === 'true'
  const success = searchParams?.success === 'true';
  const error = searchParams?.error;

  return (
    <div className="form-container" style={{ maxWidth: '600px' }}>
      <h1>Contacto</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
        Envíanos un mensaje y te responderemos lo antes posible.
      </p>

      {/* ---- Mensajes de feedback ---- */}
      {success && (
        <div className="alert alert-success">
          ✅ ¡Mensaje enviado correctamente! Te responderemos pronto.
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          ❌ Error: todos los campos marcados son obligatorios.
        </div>
      )}

      {/* ---- Formulario HTML ---- */}
      {/* action={handleContact} conecta el form con la Server Action */}
      {/* Cuando se envía, Next.js llama a handleContact(formData) */}
      <form action={handleContact}>
        <div className="form-group">
          <label htmlFor="name">Nombre *</label>
          <input type="text" id="name" name="name" required placeholder="Tu nombre" />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input type="email" id="email" name="email" required placeholder="tu@email.com" />
        </div>

        <div className="form-group">
          <label htmlFor="subject">Asunto</label>
          <select id="subject" name="subject">
            <option value="general">Consulta general</option>
            <option value="bug">Reportar un error</option>
            <option value="feature">Sugerir una mejora</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="message">Mensaje *</label>
          <textarea id="message" name="message" required placeholder="Escribe tu mensaje aquí..." />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Enviar mensaje
        </button>
      </form>
    </div>
  );
}
