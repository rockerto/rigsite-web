// app/client/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react"; // CORREGIDO: Añadido useMemo a la importación
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";

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
    console.error("Client Dashboard: Firebase config is missing or incomplete. Check your environment variables.");
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

const ClipboardIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
);


export default function ClientDashboard() {
  const [name, setName] = useState("");
  const [clave, setClave] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null); // Específico para guardar
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle"); // Para feedback de copia
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  
  // En una aplicación real, esto sería dinámico (ej. ID del usuario autenticado)
  const clientId = "demo-client"; 

  useEffect(() => {
    if (db) {
        setIsFirebaseReady(true);
    } else {
        setError("Configuración de Firebase incorrecta. No se pueden cargar los datos del cliente.");
        setLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!isFirebaseReady || !db) return;

    setLoading(true);
    setError(null);
    setSaveSuccessMessage(null);
    try {
      const ref = doc(db, "clients", clientId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "");
        setClave(data.clave || "");
      } else {
        console.log(`No se encontró el documento para el cliente: ${clientId}. Se pueden establecer valores por defecto.`);
        // Opcional: setError("No se encontró la configuración del cliente.");
      }
    } catch (err) {
      console.error("Error fetching client data:", err);
      setError("Error al cargar la configuración. Por favor, intenta de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  }, [isFirebaseReady, clientId]); // clientId añadido por si se hiciera dinámico

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFirebaseReady || !db) {
        setError("Firebase no está listo. No se pueden guardar los cambios.");
        return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccessMessage(null);
    setCopyStatus("idle");

    try {
      const ref = doc(db, "clients", clientId);
      await setDoc(ref, { name, clave }, { merge: true });
      setSaveSuccessMessage("¡Configuración guardada exitosamente!");
      // Si la clave cambia, el rigbotScript se actualizará automáticamente
    } catch (err) {
      console.error("Error saving client data:", err);
      setError("Error al guardar la configuración. Por favor, intenta de nuevo.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    }
  };

  // Generar el script del widget. Usamos useMemo para que solo se recalcule si 'clave' cambia.
  const rigbotScript = useMemo(() => {
    if (!clave) return "";
    // Asegúrate de que la URL base del widget sea la correcta para tu entorno de producción
    const widgetBaseUrl = process.env.NEXT_PUBLIC_RIGBOT_WIDGET_URL || "https://rigbot-product.vercel.app";
    return `<script src="${widgetBaseUrl}/rigbot-widget.js?clave=${encodeURIComponent(clave)}&clientId=${encodeURIComponent(clientId)}"></script>`;
  }, [clave, clientId]);

  const handleCopy = async () => {
    if (!rigbotScript) {
        setError("No hay código para copiar (la clave podría estar vacía).");
        setCopyStatus("error");
        return;
    }
    try {
      await navigator.clipboard.writeText(rigbotScript);
      setCopyStatus("success");
      setTimeout(() => setCopyStatus("idle"), 2500); // Resetear estado del botón de copiar
    } catch (err) {
      console.error("Failed to copy script:", err);
      setError("No se pudo copiar el código automáticamente. Por favor, cópialo manualmente.");
      setCopyStatus("error");
      setTimeout(() => setCopyStatus("idle"), 3000);
    }
  };
  
  if (!isFirebaseReady && !loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Configuración de Firebase</h2>
            <p className="text-slate-700 max-w-md">
                No se pudo inicializar la conexión con la base de datos. Por favor, verifica que las variables de entorno
                <code>NEXT_PUBLIC_FIREBASE_...</code> estén correctamente configuradas en tu proyecto.
            </p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-sky-100 to-indigo-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <header className="bg-slate-800 p-6 md:p-8 text-center">
            {/* Puedes añadir tu logo aquí si lo deseas, asegurándote que sea accesible */}
            {/* <img src="/path-to-your-logo.png" alt="Logo Empresa" className="w-32 h-auto mx-auto mb-4"/> */}
            <h1 className="text-3xl font-bold text-white">Panel de Cliente</h1>
            <p className="text-sky-200 mt-2">Administra la configuración y obtén el código de tu RigBot.</p>
        </header>

        <div className="p-6 md:p-10">
            {loading ? (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600 mx-auto"></div>
                <p className="text-slate-600 mt-4 text-lg">Cargando datos del cliente...</p>
            </div>
            ) : (
            <>
                <form onSubmit={handleSave} className="space-y-6 mb-10">
                    <section aria-labelledby="config-section-title">
                        <h2 id="config-section-title" className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2">Configuración General</h2>
                        <div>
                        <label htmlFor="clientName" className="block text-sm font-semibold text-slate-700 mb-1">
                            Nombre del Cliente / Empresa
                        </label>
                        <input
                            id="clientName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Clínica Dental Sonrisas Felices"
                            className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
                            disabled={saving}
                        />
                        </div>

                        <div>
                        <label htmlFor="clientClave" className="block text-sm font-semibold text-slate-700 mb-1 mt-4">
                            Clave Secreta del Widget
                        </label>
                        <input
                            id="clientClave"
                            type="password" // Mantenido como password para la edición
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            placeholder="Ingresa una clave segura para tu widget"
                            className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out"
                            disabled={saving}
                        />
                        <p className="mt-1 text-xs text-slate-500">Esta clave se usará para autenticar tu widget RigBot. Guárdala bien.</p>
                        </div>
                    </section>
                    
                    {/* Mensajes de feedback para Guardar */}
                    {error && (
                    <div className="flex items-center p-3 my-4 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm animate-pulse">
                        <ExclamationTriangleIcon />
                        <span>{error}</span>
                    </div>
                    )}
                    {saveSuccessMessage && (
                    <div className="flex items-center p-3 my-4 bg-green-50 border border-green-300 text-green-700 rounded-lg text-sm animate-pulse">
                        <CheckCircleIcon />
                        <span>{saveSuccessMessage}</span>
                    </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving || loading}
                        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                    >
                        {saving ? <SpinnerIcon /> : <CheckCircleIcon className="w-5 h-5 mr-2"/>}
                        {saving ? "Guardando Cambios..." : "Guardar Cambios"}
                    </button>
                </form>

                <section aria-labelledby="widget-code-title">
                    <h2 id="widget-code-title" className="text-xl font-semibold text-slate-700 mb-4 border-b pb-2 pt-6">Código de Integración del Widget</h2>
                    {clave ? (
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                Copia y pega el siguiente código justo antes de la etiqueta <code>&lt;/body&gt;</code> en las páginas de tu sitio web donde quieras que aparezca RigBot.
                            </p>
                            <div className="bg-slate-900 text-sm text-sky-300 p-4 rounded-lg overflow-x-auto border border-slate-700 shadow-inner">
                                <pre className="whitespace-pre-wrap break-all font-mono">{rigbotScript}</pre>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopy}
                                disabled={!rigbotScript || saving}
                                className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white transition duration-150 ease-in-out
                                ${copyStatus === 'success' ? 'bg-green-500 hover:bg-green-600' : 
                                 copyStatus === 'error' ? 'bg-red-500 hover:bg-red-600' :
                                 'bg-indigo-600 hover:bg-indigo-700'} 
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {copyStatus === 'success' ? <CheckCircleIcon /> : 
                                 copyStatus === 'error' ? <ExclamationTriangleIcon /> : 
                                 <ClipboardIcon />}
                                {copyStatus === 'success' ? "¡Copiado!" : 
                                 copyStatus === 'error' ? "Error al Copiar" : 
                                 "Copiar Código del Widget"}
                            </button>
                             {copyStatus === 'error' && <p className="text-red-600 text-xs mt-2 text-center">No se pudo copiar. Intenta manualmente.</p>}
                        </div>
                    ) : (
                        <div className="p-4 text-center bg-amber-50 border border-amber-300 text-amber-700 rounded-lg">
                            <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                            <p className="font-semibold">Define una Clave Secreta</p>
                            <p className="text-sm">Para generar el código de integración del widget, primero debes ingresar y guardar una "Clave Secreta del Widget" en la sección de configuración.</p>
                        </div>
                    )}
                </section>
            </>
            )}
            <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} RigBot Systems. Potenciando la comunicación de tu negocio.</p>
            </footer>
        </div>
      </div>
    </div>
  );
}
