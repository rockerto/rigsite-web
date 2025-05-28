// rigsite-web/src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image'; // Importar el componente Image de Next.js
import { useEffect } from 'react';

const RigBotLogo = () => (
  <div className="mb-6 text-center"> {/* Contenedor del logo */}
    <Image 
      src="/logo-rigbot.png" // Ruta a tu logo en la carpeta /public
      alt="RigBot Technologies Logo" 
      width={160} // Ancho deseado (ajusta según el tamaño de tu logo)
      height={160} // Alto deseado (ajusta según el tamaño de tu logo)
      className="mx-auto" // Centrar la imagen si es un elemento de bloque
      priority // Carga prioritaria para el logo
    />
  </div>
);

export default function HomePage() {

  useEffect(() => {
    const clientIdToUse = 'demo-client'; 
    const rigbotProductBaseUrl = process.env.NEXT_PUBLIC_RIGBOT_PRODUCT_URL;

    if (!rigbotProductBaseUrl) {
      console.error("HomePage: NEXT_PUBLIC_RIGBOT_PRODUCT_URL no está configurada.");
      return;
    }

    const widgetSrcUrl = `${rigbotProductBaseUrl}/api/widget?clientId=${encodeURIComponent(clientIdToUse)}`;
    
    console.log(`HomePage: Cargando widget desde: ${widgetSrcUrl}`);

    const existingScript = document.getElementById('rigbot-homepage-loader-script');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'rigbot-homepage-loader-script';
    script.src = widgetSrcUrl;
    script.defer = true;
    script.onload = () => {
      console.log(`HomePage: Script cargador del widget (${widgetSrcUrl}) cargado exitosamente.`);
    };
    script.onerror = () => {
      console.error(`HomePage: ERROR al cargar el script cargador del widget desde ${widgetSrcUrl}`);
    };
    document.head.appendChild(script);

    return () => {
      const scriptTag = document.getElementById('rigbot-homepage-loader-script');
      if (scriptTag) {
        // Considera remover el script al desmontar si causa problemas con HMR o navegación.
        // Por ahora, lo dejaremos para que el widget persista si el usuario navega y vuelve.
        // scriptTag.remove(); 
      }
      // Limpieza de UI del widget (esto es importante si el widget no se auto-limpia bien al quitar el script)
      const oldChatBubble = document.getElementById('rigbot-bubble-chat-custom');
      if (oldChatBubble) oldChatBubble.remove();
      const oldWhatsappBubble = document.getElementById('rigbot-bubble-whatsapp-custom');
      if (oldWhatsappBubble) oldWhatsappBubble.remove();
      const oldChatWindow = document.getElementById('rigbot-window-custom');
      if (oldChatWindow) oldChatWindow.remove();
      const oldStyles = document.getElementById('rigbot-animation-styles');
      if (oldStyles) oldStyles.remove();
      if (window.rigbotConversationHistory) {
        window.rigbotConversationHistory = [];
      }
    };
  }, []); // Array vacío para que se ejecute solo al montar/desmontar

  return (
    <>
      {/* La Navbar se renderiza desde layout.tsx, así que no la necesitamos aquí */}
      <main className="flex flex-col items-center justify-center min-h-screen px-4 pt-12 pb-20 text-center bg-slate-50 text-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 dark:text-white">
        {/* El cálculo de min-h-screen puede necesitar ajustarse según la altura real de tu Navbar */}
        {/* Ejemplo: min-h-[calc(100vh-4rem)] si la navbar mide 4rem (64px) */}
        
        <div className="w-full max-w-4xl"> {/* Contenedor para centrar y limitar ancho */}
          <RigBotLogo />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-slate-900 dark:text-white">
            Bienvenido a <span className="text-sky-500 dark:text-sky-400">RigBot</span> Technologies
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-slate-600 dark:text-slate-300">
            Tu asistente virtual inteligente para clínicas. RigBot gestiona agendamientos, responde preguntas frecuentes y optimiza la comunicación con tus pacientes, ¡24/7!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
            <Link
              href="/client/login"
              className="px-8 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transform hover:scale-105 transition-transform duration-150 ease-in-out"
            >
              Accede a tu Panel
            </Link>
            <a
              href="https://wa.me/56989967350" 
              className="px-8 py-3 bg-white dark:bg-slate-700/50 dark:hover:bg-slate-700 text-sky-500 dark:text-sky-300 font-semibold rounded-lg border-2 border-sky-500 dark:border-sky-400 hover:text-sky-600 dark:hover:text-white transform hover:scale-105 transition-all duration-150 ease-in-out"
              target="_blank"
              rel="noopener noreferrer"
            >
              Contáctanos por WhatsApp
            </a>
          </div>

          <div className="w-full max-w-2xl mx-auto p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-semibold mb-4 text-sky-600 dark:text-sky-400">Prueba nuestro Demo</h2>
              <p className="text-md mb-4 text-slate-700 dark:text-slate-400">
                  Interactúa con la burbuja de chat (debería aparecer en la esquina inferior) y descubre cómo RigBot puede consultar disponibilidad en tiempo real y responder tus dudas.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                  (Si la burbuja no aparece, asegúrate de que tu conexión a internet esté activa y no tengas bloqueadores de scripts.)
              </p>
          </div>
        </div>
      </main>
    </>
  );
}