// rigsite-web/src/app/privacidad/page.tsx
import Link from 'next/link'; // <--- IMPORTANTE: Añadir esta importación

export const metadata = {
  title: "Política de Privacidad | RigBot Systems",
  description: "Conoce cómo RigBot Systems maneja tus datos y protege tu privacidad al usar nuestros servicios de asistente virtual.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Política de Privacidad
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            RigBot Systems
          </p>
        </header>

        <article className="prose prose-slate lg:prose-lg mx-auto bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-lg">
          <p className="lead text-lg text-slate-700">
            RigBot Systems valora la privacidad de sus usuarios. Esta aplicación utiliza autorización OAuth de Google exclusivamente para acceder al calendario del usuario y verificar disponibilidad de horarios.
          </p>
          <p>
            No se modifica, elimina ni comparte información del calendario. Los datos se utilizan únicamente para ofrecer respuestas automáticas relacionadas con disponibilidad de citas.
          </p>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Datos Accedidos</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Nombre y correo del usuario autenticado (obtenidos durante el proceso de conexión de Google Calendar para identificar la cuenta conectada).</li>
            <li>Eventos del calendario del usuario (exclusivamente con permiso de solo lectura para verificar horarios ocupados y libres).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Cómo se Usan los Datos</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Para verificar la disponibilidad horaria en el calendario conectado y así poder responder a consultas sobre agendamiento realizadas a través de los asistentes virtuales RigBot.</li>
            <li>No se almacenan los detalles específicos (título, descripción, invitados, etc.) de los eventos del calendario del usuario. Solo se analizan los rangos de tiempo para determinar si están libres u ocupados.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Lo que NO se Realiza</h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>Escritura, creación o modificación de eventos en el calendario del usuario. El acceso es estrictamente de solo lectura.</li>
            <li>Recolección masiva o indiscriminada de datos del calendario. Solo se consulta la información necesaria para determinar la disponibilidad en los rangos de tiempo relevantes a una consulta.</li>
            <li>Compartición de la información del calendario o de los datos personales obtenidos a través de la conexión OAuth con terceras partes no autorizadas.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">Consultas</h2>
          <p className="text-slate-700">
            Para cualquier consulta o aclaración sobre esta Política de Privacidad, puedes contactarnos a través de:
            <a href="mailto:rig@rigquiropractico.cl" className="text-sky-600 hover:text-sky-700 underline ml-1">
              rig@rigquiropractico.cl
            </a>
          </p>
          
          <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            {/* ----- CORRECCIÓN AQUÍ: Cambiado <a> por <Link> ----- */}
            <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              &larr; Volver a la Página de Inicio
            </Link>
            {/* ------------------------------------------------- */}
          </div>
        </article>
        
        <p className="text-center text-xs text-slate-500 mt-12">
          Última actualización: 27 de mayo, 2025
        </p>
      </div>
    </div>
  );
}