// rigsite-web/src/app/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { motion } from 'framer-motion'; // Para animaciones

// Iconos para la sección de beneficios
// Añadimos un div contenedor para aplicar el group-hover de la tarjeta al ícono
const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-block p-3 bg-sky-100 dark:bg-sky-500/20 rounded-full mb-4 transition-transform duration-300 ease-in-out group-hover:scale-110">
    {children}
  </div>
);
const IconAsistente247 = () => <IconWrapper><div className="text-4xl sm:text-5xl text-sky-500 dark:text-sky-400">🤖</div></IconWrapper>;
const IconGestionAgenda = () => <IconWrapper><div className="text-4xl sm:text-5xl text-sky-500 dark:text-sky-400">📅</div></IconWrapper>;
const IconPrivacidadSegura = () => <IconWrapper><div className="text-4xl sm:text-5xl text-sky-500 dark:text-sky-400">🔒</div></IconWrapper>;


export default function HomePage() {

  useEffect(() => {
    // Lógica para cargar el widget (validada por Rigo)
    const clientIdToUse = 'demo-client';
    const rigbotProductBaseUrl = process.env.NEXT_PUBLIC_RIGBOT_PRODUCT_URL;

    if (!rigbotProductBaseUrl) {
      console.error("HomePage: NEXT_PUBLIC_RIGBOT_PRODUCT_URL no está configurada.");
      return;
    }

    const scriptId = 'rigbot-homepage-loader-script';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const widgetSrcUrl = `${rigbotProductBaseUrl}/api/widget?clientId=${encodeURIComponent(clientIdToUse)}`;
    console.log(`HomePage: Cargando widget desde: ${widgetSrcUrl}`);

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = widgetSrcUrl;
    script.defer = true;
    script.onload = () => console.log(`HomePage: Script cargador del widget (${widgetSrcUrl}) cargado exitosamente.`);
    script.onerror = () => console.error(`HomePage: ERROR al cargar el script cargador del widget desde ${widgetSrcUrl}`);
    document.head.appendChild(script);

    return () => {
      const scriptTag = document.getElementById(scriptId);
      if (scriptTag) { /* scriptTag.remove(); */ } 

      ['rigbot-bubble-chat-custom', 'rigbot-bubble-whatsapp-custom', 'rigbot-window-custom', 'rigbot-animation-styles'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
      if (window.rigbotConversationHistory) {
        window.rigbotConversationHistory = [];
      }
    };
  }, []);

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 20,
        delay: i * 0.15, 
        duration: 0.6,
      },
    }),
  };

  return (
    <>
      {/* Franja Superior para el Logo */}
      <motion.header 
        className="w-full py-2 sm:py-3 bg-slate-900 dark:bg-black shadow-lg sticky top-0 z-50" // Reducido padding vertical para acomodar logo más grande
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo-rigbot.png" 
              alt="RigBot Logo"
              width={80} // <--- TAMAÑO DEL LOGO AUMENTADO
              height={80} // <--- TAMAÑO DEL LOGO AUMENTADO
              priority
              className="transform group-hover:scale-110 transition-transform duration-200"
            />
            <span className="ml-2 sm:ml-3 text-lg sm:text-2xl font-bold text-white group-hover:text-sky-300 transition-colors">
              RigBot <span className="text-sky-400 group-hover:text-sky-300 transition-colors">Technologies</span>
            </span>
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/client/login" className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-sky-400 transition-colors">
              Accede a tu Panel
            </Link>
            <a
              href="https://wa.me/56989967350"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium bg-sky-500 hover:bg-sky-600 text-white rounded-md shadow-md transition-colors"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </motion.header>

      <main className="flex flex-col items-center text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-gray-100 dark:from-slate-900 dark:via-slate-800 dark:to-gray-900 text-slate-800 dark:text-white overflow-x-hidden">
        
        <motion.section 
          className="w-full max-w-4xl pt-20 pb-16 sm:pt-24 md:pt-28 sm:pb-24 px-4 flex flex-col items-center justify-center min-h-[calc(70vh)] sm:min-h-[calc(80vh-88px)]" // 88px es aprox la nueva altura de la navbar
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          custom={1}
          viewport={{ once: true, amount: 0.1 }}
        >
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight"> {/* <--- TAMAÑO DE TÍTULO REDUCIDO */}
            Tu Clínica <span className="block sm:inline">Siempre Eficiente,</span><br className="hidden sm:block"/> con <span className="text-sky-600 dark:text-sky-400">RigBot</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl text-slate-600 dark:text-slate-300 mb-10 px-2">
            Asistentes virtuales con IA que gestionan agendamientos, responden dudas frecuentes y optimizan la comunicación con tus pacientes, 24/7.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/client/login"
              className="w-full sm:w-auto px-8 py-4 bg-sky-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-sky-700 transform hover:scale-105 transition-all duration-150 ease-in-out"
            >
              Comienza Ahora
            </Link>
            <a
              href="https://wa.me/56989967350"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 border-2 border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-500 dark:hover:bg-slate-700/50 rounded-lg text-lg font-semibold hover:bg-sky-50/50 transform hover:scale-105 transition-all duration-150 ease-in-out"
            >
              Habla con un Experto
            </a>
          </div>
        </motion.section>

        <motion.section 
          className="w-full bg-white dark:bg-slate-800/90 py-16 sm:py-24 px-6 border-y border-slate-200 dark:border-slate-700 shadow-sm"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          custom={2} 
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white">
              Potencia tu Clínica con Inteligencia Artificial
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                { icon: <IconAsistente247 />, title: "Asistencia Ininterrumpida 24/7", description: "RigBot responde consultas y agenda citas por ti, incluso fuera de horario, liberando tu tiempo." },
                { icon: <IconGestionAgenda />, title: "Agenda Siempre al Día", description: "Integración con Google Calendar para verificar tu disponibilidad en tiempo real y evitar conflictos." },
                { icon: <IconPrivacidadSegura />, title: "Comunicación Eficaz y Segura", description: "Reduce llamadas repetitivas y maneja la información de tus pacientes con la privacidad que merecen." }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl shadow-lg text-center border border-slate-200 dark:border-slate-700 hover:shadow-2xl transition-shadow duration-300 group" // Añadido 'group' para el hover del ícono
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {item.icon} {/* IconWrapper ya tiene el group-hover:scale-110 */}
                  <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="w-full max-w-3xl py-16 sm:py-24 px-4"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          custom={3}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-800/70 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-sky-600 dark:text-sky-400">Prueba nuestro Demo Interactivo</h2>
              <p className="text-md mb-4 text-slate-700 dark:text-slate-400 mx-auto">
                  Interactúa con la burbuja de chat (debería aparecer en la esquina inferior) y descubre cómo RigBot puede consultar disponibilidad y responder dudas.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                  (Este demo usa una configuración genérica y nuestro calendario de ejemplo.)
              </p>
          </div>
        </motion.section>
      </main>

      <footer className="py-10 text-center text-sm text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
        © {new Date().getFullYear()} RigBot Technologies by Rigquiropráctico. Todos los derechos reservados.
        <p className="mt-1">
            <Link href="/privacidad" className="hover:text-sky-500 transition-colors">Política de Privacidad</Link>
        </p>
      </footer>
    </>
  );
}