// ============================================
// PÁGINA: About → RUTA ESTÁTICA: /about
// ============================================
// Otra ruta estática. El archivo está en:
// app/about/page.jsx → se mapea a "/about"
//
// Demuestra: Rutas estáticas, metadata por página

export const metadata = {
  title: 'Acerca de',
  description: 'Información sobre este tutorial de MVC con Next.js',
};

export default function AboutPage() {
  // ---- Variables que se usan en la "plantilla" ----
  // En un motor de plantillas, esto sería equivalente a
  // pasar variables desde el controlador a la vista:
  const features = [
    { icon: '🛣️', title: 'Rutas', desc: 'Estáticas y dinámicas con App Router' },
    { icon: '🎮', title: 'Controladores', desc: 'Route Handlers para GET y POST' },
    { icon: '📝', title: 'Formularios', desc: 'Gestión de formularios y subida de archivos' },
    { icon: '🗄️', title: 'Base de datos', desc: 'Prisma ORM con MySQL' },
    { icon: '🔐', title: 'Autenticación', desc: 'Registro, login, logout y sesiones' },
    { icon: '🛡️', title: 'Permisos', desc: 'Control de acceso por roles con middleware' },
    { icon: '🍪', title: 'Cookies', desc: 'Gestión de consentimiento y preferencias' },
    { icon: '⚠️', title: 'Errores', desc: 'Manejo de errores y redirecciones' },
  ];

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1>Acerca de este Tutorial</h1>
      <p className="mt-1" style={{ color: '#6b7280', maxWidth: '700px' }}>
        Esta aplicación demuestra cómo usar Next.js como un framework MVC completo
        para desarrollo web backend. Cubre todos los conceptos fundamentales que
        necesitas para construir aplicaciones web modernas.
      </p>

      <div className="posts-grid" style={{ marginTop: '2rem' }}>
        {features.map((feature, index) => (
          <div key={index} className="post-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
