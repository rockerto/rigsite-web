// rigsite-fixed/app/client/chatbot-settings/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore"; 
import type { FirebaseApp } from "firebase/app"; 
import { initializeApp, getApps, getApp } from "firebase/app"; 
import Link from 'next/link';
import { useUser } from "@/context/UserContext";

// --- ICONOS (PLACEHOLDERS SIMPLES) ---
const CheckCircleIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (<span className={className}>✔️</span>);
const ExclamationTriangleIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (<span className={className}>⚠️</span>);
const SpinnerIcon = () => (<span className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">🔄</span>);
const ArrowLeftIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (<span className={className}>⬅️</span>);
const Cog8ToothIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (<span className={className}>⚙️</span>);
// --- FIN ICONOS ---

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- INICIO DE CORRECCIÓN DE RIGO PARA INICIALIZACIÓN DE appClient y dbFs ---
const isValidConfig = firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

let appClient: FirebaseApp | null = null; // Inicializar como null

if (isValidConfig) {
  if (!getApps().length) {
    appClient = initializeApp(firebaseConfig);
  } else {
    appClient = getApp();
  }
} else {
  console.error("Chatbot Settings Page: Firebase config is missing or incomplete. Check your environment variables. dbFs will be undefined.");
}

const dbFs = appClient ? getFirestore(appClient) : undefined;
// --- FIN DE CORRECCIÓN DE RIGO ---

export default function ChatbotSettingsPage() {
  const { user, clientId: authenticatedClientId, firebaseAuthLoading, clientDataLoading: contextClientDataLoading } = useUser();

  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horario, setHorario] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [calendarQueryDays, setCalendarQueryDays] = useState<number | string>("");
  const [calendarMaxUserRequestDays, setCalendarMaxUserRequestDays] = useState<number | string>("");
  const [pricingInfo, setPricingInfo] = useState("");
  const [chiropracticVideoUrl, setChiropracticVideoUrl] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [clientName, setClientName] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!dbFs) { // dbFs podría ser undefined si la config de Firebase es inválida
        setError("Error: No se pudo inicializar la conexión con Firestore para cargar datos. Revisa la configuración de Firebase.");
        setPageLoading(false);
        return;
    }
    if (!user || !authenticatedClientId) {
      console.warn("ChatbotSettingsPage: fetchData abortado - no hay usuario o authenticatedClientId (desde contexto).");
      setPageLoading(false);
      return;
    }

    console.log("ChatbotSettingsPage: Iniciando fetchData para authenticatedClientId:", authenticatedClientId);
    setPageLoading(true);
    setError(null);
    setSaveSuccessMessage(null);

    try {
      const clientDocRef = doc(dbFs, "clients", authenticatedClientId);
      const clientDocSnap = await getDoc(clientDocRef);
      if (clientDocSnap.exists()) {
        const data = clientDocSnap.data();
        console.log("ChatbotSettingsPage: Datos cargados de Firestore:", data);
        setTelefono(data.telefono || "");
        setDireccion(data.direccion || "");
        setHorario(data.horario || "");
        setBasePrompt(data.basePrompt || "Eres un asistente virtual útil y amigable.");
        setWhatsappNumber(data.whatsappNumber || "");
        setCalendarQueryDays(data.calendarQueryDays || 7);
        setCalendarMaxUserRequestDays(data.calendarMaxUserRequestDays || 21);
        setPricingInfo(data.pricingInfo || "");
        setChiropracticVideoUrl(data.chiropracticVideoUrl || "");
        setWelcomeMessage(data.welcomeMessage || "¡Hola! ¿En qué puedo ayudarte hoy?");
        setFallbackMessage(data.fallbackMessage || "Lo siento, no te he entendido. ¿Podrías intentarlo de nuevo?");
        setClientName(data.name || user.displayName || "Cliente");
      } else {
        console.log(`ChatbotSettingsPage: No se encontró config. para cliente: ${authenticatedClientId}. Usando valores por defecto para el formulario.`);
        setClientName(user.displayName || "Cliente Nuevo");
        setBasePrompt("Eres un asistente virtual útil y amigable.");
        setWelcomeMessage("¡Bienvenido!");
      }
    } catch (err) { 
      console.error("ChatbotSettingsPage: Error fetching chatbot settings:", err);
      let errorMessage = "Ocurrió un error desconocido al cargar.";
      if (err instanceof Error) { errorMessage = err.message; } 
      else if (typeof err === 'string') { errorMessage = err; }
      if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
          const firebaseError = err as { code: string; message: string };
          errorMessage = `Error (${firebaseError.code}): ${firebaseError.message}`;
      }
      setError(`Error al cargar la configuración: ${errorMessage}`);
    } finally {
      setPageLoading(false);
    }
  }, [authenticatedClientId, user]); // dbFs quitado

  useEffect(() => {
    if (firebaseAuthLoading || contextClientDataLoading) {
      console.log("ChatbotSettingsPage (useEffect): Esperando que UserContext cargue auth/clientData...");
      setPageLoading(true);
      return;
    }
    if (user && authenticatedClientId) {
      console.log("ChatbotSettingsPage (useEffect): UserContext listo, llamando a fetchData.");
      if (!dbFs) { // Nueva verificación por si dbFs es undefined
          setError("Error: Configuración de Firebase incompleta. No se pueden cargar los datos del chatbot.");
          setPageLoading(false);
          return;
      }
      fetchData();
    } else {
      console.log("ChatbotSettingsPage (useEffect): No hay usuario autenticado o clientId después de la carga del contexto.");
      setPageLoading(false);
    }
  }, [fetchData, user, authenticatedClientId, firebaseAuthLoading, contextClientDataLoading]);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!dbFs) { // Nueva verificación
        setError("Error: No se pudo inicializar la conexión con Firestore para guardar datos. Revisa la configuración de Firebase.");
        return;
    }
    if (!user || !authenticatedClientId) {
        setError("Usuario no autenticado. No se pueden guardar los cambios.");
        return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccessMessage(null);

    const settingsToSave = {
        name: clientName || user.displayName || "Cliente Rigbot", 
        email: user.email || "",
        telefono, direccion, horario, basePrompt, whatsappNumber,
        calendarQueryDays: Number(calendarQueryDays) || 7,
        calendarMaxUserRequestDays: Number(calendarMaxUserRequestDays) || 21,
        pricingInfo, chiropracticVideoUrl, welcomeMessage, fallbackMessage,
    };

    try {
      const clientDocRef = doc(dbFs, "clients", authenticatedClientId);
      await setDoc(clientDocRef, settingsToSave, { merge: true }); 
      setSaveSuccessMessage("¡Configuración del chatbot guardada exitosamente!");
      console.log("ChatbotSettingsPage: Configuración guardada para", authenticatedClientId, settingsToSave);
    } catch (err) { 
      console.error("ChatbotSettingsPage: Error saving chatbot settings:", err);
      let errorMessage = "Ocurrió un error desconocido al guardar.";
      if (err instanceof Error) { errorMessage = err.message; }
      else if (typeof err === 'string') { errorMessage = err; }
      if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
          const firebaseError = err as { code: string; message: string };
          errorMessage = `Error (${firebaseError.code}): ${firebaseError.message}`;
      }
      setError(`Error al guardar la configuración: ${errorMessage}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };
  
  if (firebaseAuthLoading || contextClientDataLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600 mx-auto"></div>
            <p className="text-slate-600 mt-4 text-lg">Cargando datos de usuario y cliente...</p>
        </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-600 mb-2">Acceso Denegado</h2>
        <p className="text-slate-700 max-w-md mb-4">
            Debes iniciar sesión para acceder a la configuración de tu chatbot.
        </p>
        <Link href="/client/login" className="text-blue-600 hover:underline">
            Ir a la página de Login
        </Link>
      </div>
    );
  }

  if (!dbFs && !pageLoading) { // Si dbFs no se pudo inicializar (isValidConfig fue false) y no estamos en otro loading
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Configuración de Firebase</h2>
            <p className="text-slate-700 max-w-md">
                No se pudo inicializar la conexión con la base de datos para esta página. 
                Por favor, verifica que las variables de entorno <code>NEXT_PUBLIC_FIREBASE_...</code> estén correctamente configuradas.
            </p>
        </div>
    );
  }
  
  if (pageLoading && !clientName && authenticatedClientId) { 
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="text-slate-600 mt-4 text-lg">Cargando configuración del chatbot...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-slate-700 p-6 md:p-8 text-center">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center">
                <Cog8ToothIcon />Configuración Avanzada de RigBot
            </h1>
            {clientName && <p className="text-indigo-200 mt-1">Para: {clientName}</p>}
            <p className="text-indigo-200 mt-2">Personaliza el comportamiento y la información de tu chatbot.</p>
        </header>
        <div className="p-6 md:p-10">
          <form onSubmit={handleSaveSettings} className="space-y-8">
              <section aria-labelledby="contact-info-title">
                  <h3 id="contact-info-title" className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Información de Contacto y Negocio</h3>
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <label htmlFor="telefono" className="block text-sm font-semibold text-slate-700 mb-1">Teléfono de Contacto (General)</label>
                              <input id="telefono" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: +56 9 1234 5678" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={saving}/>
                          </div>
                          <div>
                              <label htmlFor="whatsappNumber" className="block text-sm font-semibold text-slate-700 mb-1">Número de WhatsApp (para Derivaciones)</label>
                              <input id="whatsappNumber" type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="Ej: +56 9 8765 4321" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={saving}/>
                          </div>
                      </div>
                      <div>
                          <label htmlFor="direccion" className="block text-sm font-semibold text-slate-700 mb-1">Dirección Física</label>
                          <input id="direccion" type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej: Van Buren 129, Copiapó" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={saving}/>
                      </div>
                      <div>
                          <label htmlFor="horario" className="block text-sm font-semibold text-slate-700 mb-1">Horario de Atención</label>
                          <input id="horario" type="text" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="Ej: Lunes a Viernes de 10:00 a 19:30" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={saving}/>
                      </div>
                  </div>
              </section>

              <section aria-labelledby="calendar-settings-title">
                  <h3 id="calendar-settings-title" className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2 pt-4">Configuración del Calendario</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                          <label htmlFor="calendarQueryDays" className="block text-sm font-semibold text-slate-700 mb-1">Días de Búsqueda en Calendario</label>
                          <input id="calendarQueryDays" type="number" value={calendarQueryDays} onChange={(e) => setCalendarQueryDays(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej: 7" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" min="1" disabled={saving}/>
                          <p className="mt-1 text-xs text-slate-500">Cuántos días a futuro revisará el bot por defecto.</p>
                      </div>
                      <div>
                          <label htmlFor="calendarMaxUserRequestDays" className="block text-sm font-semibold text-slate-700 mb-1">Límite de Consulta de Días Lejanos</label>
                          <input id="calendarMaxUserRequestDays" type="number" value={calendarMaxUserRequestDays} onChange={(e) => setCalendarMaxUserRequestDays(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Ej: 21" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" min="1" disabled={saving}/>
                           <p className="mt-1 text-xs text-slate-500">Máximo de días a futuro que el bot considerará antes de derivar.</p>
                      </div>
                  </div>
              </section>
              
              <section aria-labelledby="content-settings-title">
                   <h3 id="content-settings-title" className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2 pt-4">Contenido Personalizado del Bot</h3>
                  <div className="space-y-6">
                      <div>
                          <label htmlFor="pricingInfo" className="block text-sm font-semibold text-slate-700 mb-1">Información de Precios y Paquetes</label>
                          <textarea id="pricingInfo" value={pricingInfo} onChange={(e) => setPricingInfo(e.target.value)} placeholder="Detalla tus precios y promociones aquí..." className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-24" disabled={saving}/>
                      </div>
                      <div>
                          <label htmlFor="chiropracticVideoUrl" className="block text-sm font-semibold text-slate-700 mb-1">URL Video Explicativo (Quiropraxia)</label>
                          <input id="chiropracticVideoUrl" type="url" value={chiropracticVideoUrl} onChange={(e) => setChiropracticVideoUrl(e.target.value)} placeholder="Ej: https://youtube.com/..." className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" disabled={saving}/>
                      </div>
                      <div>
                          <label htmlFor="welcomeMessage" className="block text-sm font-semibold text-slate-700 mb-1">Mensaje de Bienvenida del Bot (Widget)</label>
                          <textarea id="welcomeMessage" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} placeholder="Ej: ¡Hola! Soy tu asistente virtual..." className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-20" disabled={saving}/>
                      </div>
                       <div>
                          <label htmlFor="fallbackMessage" className="block text-sm font-semibold text-slate-700 mb-1">Mensaje de Fallback del Bot (Widget)</label>
                          <textarea id="fallbackMessage" value={fallbackMessage} onChange={(e) => setFallbackMessage(e.target.value)} placeholder="Ej: Lo siento, no entendí. ¿Puedes reformular?" className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-20" disabled={saving}/>
                      </div>
                      <div>
                          <label htmlFor="basePrompt" className="block text-sm font-semibold text-slate-700 mb-1">Prompt Base Personalizado (Cerebro de OpenAI)</label>
                          <textarea
                              id="basePrompt" value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)}
                              placeholder="Define el comportamiento, tono y capacidades principales de tu RigBot aquí..."
                              className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-48 font-mono text-xs"
                              disabled={saving}
                          />
                          <p className="mt-1 text-xs text-slate-500">Este es el prompt de sistema para OpenAI. Edita con cuidado. Puedes usar placeholders como {"${DAYS_TO_QUERY_CALENDAR}"} o {"${MAX_DAYS_FOR_USER_REQUEST}"} que se reemplazarán con los valores de arriba. También: {"${whatsappNumber}"}, {"${pricingInfo}"}, {"${direccion}"}, {"${horario}"}, {"${chiropracticVideoUrl}"}.</p>
                      </div>
                  </div>
              </section>

              {error && (
              <div className="flex items-center p-3 my-4 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm shadow-md">
                  <ExclamationTriangleIcon /> <span>{error}</span>
              </div>
              )}
              {saveSuccessMessage && (
              <div className="flex items-center p-3 my-4 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm shadow-md">
                  <CheckCircleIcon /> <span>{saveSuccessMessage}</span>
              </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                      type="submit"
                      disabled={saving || pageLoading || firebaseAuthLoading || contextClientDataLoading } 
                      className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  >
                      {saving ? <SpinnerIcon /> : <CheckCircleIcon />}
                      {saving ? "Guardando Configuración..." : "Guardar Configuración del Chatbot"}
                  </button>
                  <Link href="/client" legacyBehavior>
                      <a className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 border border-slate-300 text-base font-semibold rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                          <ArrowLeftIcon /> Volver al Panel Principal
                      </a>
                  </Link>
              </div>
          </form>
          <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
              <p>© {new Date().getFullYear()} RigBot Systems. Configuración Avanzada.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}