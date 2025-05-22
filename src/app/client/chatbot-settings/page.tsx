// app/client/chatbot-settings/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import Link from 'next/link'; // Para el botón de volver

// ⚠️ ADVERTENCIA DE SEGURIDAD: Mover a variables de entorno es altamente recomendado.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
if (
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
} else {
    console.error("Chatbot Settings: Firebase config is missing or incomplete. Check your environment variables.");
}

const db = app ? getFirestore(app) : undefined;

// Iconos
const CheckCircleIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ExclamationTriangleIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
  </svg>
);
const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const ArrowLeftIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);
const Cog8ToothIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.39 1.024 0 1.414l-.527.737c-.25.35-.272.806-.108 1.204.165.399.505.71.93.78l.895.149c.542.09.94.56.94 1.11v1.093c0 .55-.398 1.02-.94 1.11l-.895.149c-.425.07-.765.383-.93.78-.165.398-.142.854.108 1.204l.527.738c.39.39.39 1.024 0 1.414l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.399.165-.71.505-.781.93l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.773-.774a1.125 1.125 0 010-1.414l.527-.737c.25-.35.273-.806.108-1.204-.165-.399-.506-.71-.93-.78l-.895-.149c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.02.94-1.11l.895-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.399-.165.71-.505.78-.93l.15-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


export default function ChatbotSettingsPage() {
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [horario, setHorario] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [calendarQueryDays, setCalendarQueryDays] = useState<number | string>(7);
  const [calendarMaxUserRequestDays, setCalendarMaxUserRequestDays] = useState<number | string>(21);
  const [pricingInfo, setPricingInfo] = useState("");
  const [chiropracticVideoUrl, setChiropracticVideoUrl] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  
  const clientId = "demo-client"; // Este ID debe ser consistente con el del dashboard principal

  useEffect(() => {
    if (db) {
        setIsFirebaseReady(true);
    } else {
        setError("Configuración de Firebase incorrecta. No se pueden cargar los datos.");
        setLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!isFirebaseReady || !db) {
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    setSaveSuccessMessage(null);
    try {
      const ref = doc(db, "clients", clientId); 
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
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
      } else {
        console.log(`No se encontró config. avanzada para el cliente: ${clientId}. Usando valores por defecto.`);
        setWelcomeMessage("¡Hola! ¿En qué puedo ayudarte hoy?");
        setFallbackMessage("Lo siento, no te he entendido. ¿Podrías intentarlo de nuevo?");
        setCalendarQueryDays(7);
        setCalendarMaxUserRequestDays(21);
        setBasePrompt("Eres un asistente virtual útil y amigable.");
      }
    } catch (err) {
      console.error("Error fetching chatbot settings:", err);
      setError("Error al cargar la configuración del chatbot. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [isFirebaseReady, clientId]);

  useEffect(() => {
    if(isFirebaseReady){
        fetchData();
    }
  }, [isFirebaseReady, fetchData]);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFirebaseReady || !db) {
        setError("Firebase no está listo. No se pueden guardar los cambios.");
        return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccessMessage(null);

    const settingsToSave = {
        telefono,
        direccion,
        horario,
        basePrompt,
        whatsappNumber,
        calendarQueryDays: Number(calendarQueryDays),
        calendarMaxUserRequestDays: Number(calendarMaxUserRequestDays),
        pricingInfo,
        chiropracticVideoUrl,
        welcomeMessage,
        fallbackMessage,
    };

    try {
      const ref = doc(db, "clients", clientId); 
      await setDoc(ref, settingsToSave, { merge: true }); 
      setSaveSuccessMessage("¡Configuración del chatbot guardada exitosamente!");
    } catch (err) {
      console.error("Error saving chatbot settings:", err);
      setError("Error al guardar la configuración del chatbot. Intenta de nuevo.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };
  
  if (!isFirebaseReady && loading) { 
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600 mx-auto"></div>
            <p className="text-slate-600 mt-4 text-lg">Inicializando...</p>
        </div>
    );
  }
  
  if (!isFirebaseReady && !loading) { 
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Configuración de Firebase</h2>
            <p className="text-slate-700 max-w-md">
                No se pudo inicializar la conexión con la base de datos. Por favor, verifica las variables de entorno.
            </p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex flex-col items-center py-10 px-4 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-slate-700 p-6 md:p-8 text-center">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center">
                <Cog8ToothIcon className="w-8 h-8 mr-3 text-indigo-300"/>Configuración Avanzada de RigBot
            </h1>
            <p className="text-indigo-200 mt-2">Personaliza el comportamiento y la información de tu chatbot.</p>
        </header>

        <div className="p-6 md:p-10">
            {loading ? (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
                <p className="text-slate-600 mt-4 text-lg">Cargando configuración del chatbot...</p>
            </div>
            ) : (
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
                            <label htmlFor="welcomeMessage" className="block text-sm font-semibold text-slate-700 mb-1">Mensaje de Bienvenida del Bot</label>
                            <textarea id="welcomeMessage" value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} placeholder="Ej: ¡Hola! Soy tu asistente virtual..." className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition h-20" disabled={saving}/>
                        </div>
                         <div>
                            <label htmlFor="fallbackMessage" className="block text-sm font-semibold text-slate-700 mb-1">Mensaje de Fallback del Bot (si no entiende)</label>
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
                            {/* ***** CORRECCIÓN AQUÍ ***** */}
                            <p className="mt-1 text-xs text-slate-500">Este es el prompt de sistema para OpenAI. Edita con cuidado. Puedes usar placeholders como ${'{DAYS_TO_QUERY_CALENDAR}'} o ${'{MAX_DAYS_FOR_USER_REQUEST}'} que se reemplazarán con los valores de la sección &ldquo;Configuración del Calendario&rdquo;.</p>
                        </div>
                    </div>
                </section>

                {error && (
                <div className="flex items-center p-3 my-4 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm shadow-md">
                    <ExclamationTriangleIcon className="text-red-500"/>
                    <span>{error}</span>
                </div>
                )}
                {saveSuccessMessage && (
                <div className="flex items-center p-3 my-4 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm shadow-md">
                    <CheckCircleIcon className="text-green-500"/>
                    <span>{saveSuccessMessage}</span>
                </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                        {saving ? <SpinnerIcon /> : <CheckCircleIcon className="w-6 h-6 mr-2"/>}
                        {saving ? "Guardando Configuración..." : "Guardar Configuración del Chatbot"}
                    </button>
                    <Link href="/client" legacyBehavior>
                        <a className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 border border-slate-300 text-base font-semibold rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                            <ArrowLeftIcon className="text-slate-600"/>
                            Volver al Panel Principal
                        </a>
                    </Link>
                </div>
            </form>
            )}
            <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
                <p>© {new Date().getFullYear()} RigBot Systems. Configuración Avanzada.</p>
            </footer>
        </div>
      </div>
    </div>
  );
}