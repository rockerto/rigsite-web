'use client';

export default function Home() {
  return (
    <>
      <main className="flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center bg-white text-black">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Bienvenido a Rigbot 👋
        </h1>
        <p className="text-lg sm:text-xl max-w-2xl mb-6 text-gray-700">
          Esta es una demo funcional de nuestro asistente virtual para clínicas.
          Puedes interactuar con la burbuja aquí abajo y ver cómo consulta horarios reales desde Google Calendar.
        </p>
        <p className="text-base sm:text-lg text-gray-600">
          ¿Te gustaría tener uno como este en tu sitio?
          <br />
          <a
            href="https://wa.me/56989967350"
            className="text-blue-600 font-semibold hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Escríbenos por WhatsApp aquí →
          </a>
        </p>
      </main>

      {/* Inyectamos la burbuja del Rigbot */}
      <script src="/rigbot-widget.js" defer></script>
    </>
  );
}
