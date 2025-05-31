// rigsite-fixed/src/app/client/page.tsx
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { doc, getDoc, setDoc, getFirestore, type Firestore, type FirestoreError } from "firebase/firestore";
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import Link from 'next/link';
import { useUser } from "@/context/UserContext"; // Asumiendo que tu UserContext está en esta ruta
import { auth } from "@/lib/firebase"; // Asumiendo que auth se exporta desde lib/firebase

// --- ICONOS ---
const CheckCircleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);
const ExclamationTriangleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.031-1.742 3.031H4.42c-1.526 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
);
const SpinnerIcon = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);
const ClipboardIcon = ({ className = "w-4 h-4 inline mr-1" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
);
const Cog8ToothIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => ( // Icono existente para Config. Avanzada
    <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M11.07 2.564a1.5 1.5 0 011.86 0l7.5 4.5A1.5 1.5 0 0121 8.53V15.5a1.5 1.5 0 01-.797 1.332l-7.5 4.5a1.5 1.5 0 01-1.86 0l-7.5-4.5A1.5 1.5 0 013 15.47V8.53a1.5 1.5 0 01.797-1.332l7.5-4.5zM4.5 8.53L12 12.82l7.5-4.29v6.94L12 19.72l-7.5-4.29V8.53z" clipRule="evenodd" /><path d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" /></svg>
);
// NUEVO ICONO AÑADIDO (o puedes usar Cog8ToothIcon si prefieres no añadir otro)
const CogIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => ( 
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
);
const ArrowRightOnRectangleIcon = ({ className = "w-5 h-5 ml-2" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
);
const CalendarIcon = ({ className = "w-5 h-5 mr-2 -ml-1" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
);
// --- FIN ICONOS ---

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let appClient: FirebaseApp | null = null;
const isValidFirebaseConfig = firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId;

if (isValidFirebaseConfig) {
    if (!getApps().length) {
        appClient = initializeApp(firebaseConfig);
    } else {
        appClient = getApp();
    }
} else {
    console.error("ClientDashboard Main: Firebase config is missing or incomplete.");
}
const dbFs: Firestore | undefined = appClient ? getFirestore(appClient) : undefined;

export default function ClientDashboard() {
    const {
        user,
        clientId: authenticatedClientIdFromContext,
        clientData: clientDataFromContext,
        firebaseAuthLoading,
        clientDataLoading: contextClientDataLoading
    } = useUser();

    const [name, setName] = useState("");
    const [clave, setClave] = useState("");
    const [pageSpecificLoading, setPageSpecificLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
    const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

    useEffect(() => {
        if (!contextClientDataLoading && clientDataFromContext) {
            setName(clientDataFromContext.name || user?.displayName || "");
        } else if (!contextClientDataLoading && user && !clientDataFromContext) {
            setName(user.displayName || "Nuevo Usuario");
        }
    }, [clientDataFromContext, user, contextClientDataLoading]);

    const fetchPageSpecificData = useCallback(async (clientIdToFetch: string) => {
        if (!dbFs) {
            setError("Error: Configuración de Firebase (dbFs) no disponible para cargar 'clave'.");
            setPageSpecificLoading(false);
            return;
        }
        
        console.log("ClientDashboard Main: Iniciando fetchPageSpecificData (para clave) con clientId:", clientIdToFetch);
        setPageSpecificLoading(true);
        setError(null);
        try {
            const clientDocRef = doc(dbFs, "clients", clientIdToFetch);
            const clientDocSnap = await getDoc(clientDocRef);
            if (clientDocSnap.exists()) {
                const data = clientDocSnap.data();
                setClave(data.clave || "");
                if (!name && data.name) { // Solo actualiza 'name' si aún no tiene valor
                    setName(data.name);
                }
            } else {
                setClave(""); 
            }
        } catch (e) {
            const err = e as FirestoreError;
            console.error("ClientDashboard Main: Error fetching page-specific data (clave):", err);
            setError(`Error (${err.code || 'desconocido'}) al cargar datos de 'clave': ${err.message}`);
        } finally {
            setPageSpecificLoading(false);
        }
    }, [name]); // 'name' en dependencias por si se actualiza desde el contexto y queremos re-evaluar.

    useEffect(() => {
        if (firebaseAuthLoading || contextClientDataLoading) {
            setPageSpecificLoading(true);
            return;
        }

        if (!user) {
            setPageSpecificLoading(false);
            return;
        }

        if (user && authenticatedClientIdFromContext) {
            if (dbFs) {
                fetchPageSpecificData(authenticatedClientIdFromContext);
            } else {
                setError("Error crítico: Configuración de Firebase (dbFs) no disponible.");
                setPageSpecificLoading(false);
            }
        } else if (user && !authenticatedClientIdFromContext && !contextClientDataLoading) {
            console.warn("ClientDashboard Main: UserContext cargado, hay usuario, pero no authenticatedClientIdFromContext.");
            setError("No se pudo obtener el ID del cliente. Intenta recargar la página.");
            setPageSpecificLoading(false);
        } else {
             setPageSpecificLoading(false);
        }
    }, [
        user,
        authenticatedClientIdFromContext,
        firebaseAuthLoading,
        contextClientDataLoading,
        fetchPageSpecificData,
    ]);

    const handleSaveNameAndClave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dbFs) {
             setError("Error: Configuración de Firebase no disponible para guardar.");
             return;
        }
        if (!user || !authenticatedClientIdFromContext) {
            setError("Usuario no autenticado o ID de cliente no disponible.");
            return;
        }

        setSaving(true);
        setError(null);
        setSaveSuccessMessage(null);
        const dataToSave = { name: name || user.displayName || "Cliente Rigbot", clave };

        try {
            const clientDocRef = doc(dbFs, "clients", authenticatedClientIdFromContext);
            await setDoc(clientDocRef, dataToSave, { merge: true });
            setSaveSuccessMessage("¡Nombre y Clave guardados exitosamente!");
        } catch (error) {
            const err = error as FirestoreError;
            setError(`Error (${err.code || 'desconocido'}) al guardar: ${err.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setSaveSuccessMessage(null), 4000);
        }
    };

    const rigbotScript = useMemo(() => {
        if (!authenticatedClientIdFromContext) {
            return "// Esperando Client ID para generar el script...\n// Por favor, asegúrate de estar logueado.";
        }

        const rigbotProductBaseUrl = process.env.NEXT_PUBLIC_RIGBOT_PRODUCT_URL;

        if (!rigbotProductBaseUrl) {
            console.error("ClientDashboard Main: La variable de entorno NEXT_PUBLIC_RIGBOT_PRODUCT_URL no está configurada en rigsite-web.");
            return `// Error: URL del backend (rigbot-product) no configurada.\n// (Verifica NEXT_PUBLIC_RIGBOT_PRODUCT_URL en Vercel para rigsite-web)`;
        }

        let widgetSrcUrl = `${rigbotProductBaseUrl}/api/widget?clientId=${encodeURIComponent(authenticatedClientIdFromContext)}`;
        
        if (clave && clave.trim() !== "") {
            widgetSrcUrl += `&clave=${encodeURIComponent(clave)}`;
        }

        return `<script src="${widgetSrcUrl}" defer></script>`;
    }, [authenticatedClientIdFromContext, clave]);

    const handleCopy = async () => {
        if (rigbotScript.startsWith("//")) { 
             setCopyStatus("error"); setTimeout(() => setCopyStatus("idle"), 2000); return;
        }
        try {
             await navigator.clipboard.writeText(rigbotScript);
             setCopyStatus("success"); setTimeout(() => setCopyStatus("idle"), 2000);
        } catch (_err) { 
             console.error("ClientDashboard Main: Failed to copy script:", _err);
             setCopyStatus("error"); setTimeout(() => setCopyStatus("idle"), 2000);
        }
    };

    const handleLogout = async () => {
        try {
             await auth.signOut();
             console.log("Usuario cerró sesión");
             // window.location.href = '/client/login'; // O usar router de Next.js si prefieres
        } catch (e) {
             const err = e as Error;
             console.error("Error al cerrar sesión:", err);
             setError("Error al cerrar sesión: " + err.message);
        }
    };

    if (firebaseAuthLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
                 <p className="text-slate-600 dark:text-slate-300 mt-4 text-lg">Cargando autenticación...</p>
             </div>
        );
    }

    if (!user) {
        return ( 
             <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 text-center">
                 <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Acceso Denegado</h2>
                 <p className="text-slate-700 dark:text-slate-300 max-w-md mb-4">Debes iniciar sesión para acceder a tu panel de cliente.</p>
                 <Link href="/client/login" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition">
                      Ir a la página de Login
                 </Link>
             </div>
        );
    }

    if (contextClientDataLoading || pageSpecificLoading) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
                 <p className="text-slate-600 dark:text-slate-300 mt-4 text-lg">Cargando datos del cliente...</p>
             </div>
        );
    }
    
    if (!dbFs) { 
        return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4 text-center">
                 <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error de Configuración Crítico</h2>
                 <p className="text-slate-700 dark:text-slate-300 max-w-md">No se pudo inicializar la conexión con la base de datos. Verifica las variables de Firebase.</p>
                 {error && <p className="text-red-500 dark:text-red-400 mt-2 text-sm">{error}</p>}
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-800 dark:to-slate-900 py-8 px-4 font-sans text-slate-800 dark:text-slate-200">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 shadow-2xl rounded-xl overflow-hidden">
                <header className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600 text-white p-6 md:p-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Panel de Cliente</h1>
                            <p className="text-indigo-200 text-sm mt-1">Bienvenido, {name || user.displayName || 'Usuario'}</p>
                        </div>
                        <button 
                             onClick={handleLogout}
                             className="flex items-center text-sm font-medium bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-lg transition"
                             title="Cerrar Sesión"
                        >
                             Cerrar Sesión <ArrowRightOnRectangleIcon />
                        </button>
                    </div>
                </header>

                <main className="p-6 md:p-10 space-y-10">
                    {error && !pageSpecificLoading && !contextClientDataLoading && (
                         <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4 rounded-md shadow-md" role="alert">
                             <div className="flex">
                                 <div className="py-1"><ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" /></div>
                                 <div>
                                     <p className="font-bold">¡Atención! Ha Ocurrido un Error:</p>
                                     <p className="text-sm">{error}</p>
                                 </div>
                             </div>
                         </div>
                    )}
                    {saveSuccessMessage && (
                         <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 dark:border-green-400 text-green-700 dark:text-green-300 p-4 rounded-md shadow-md" role="alert">
                             <div className="flex">
                                 <div className="py-1"><CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-3" /></div>
                                 <div>
                                     <p className="font-bold">¡Éxito!</p>
                                     <p className="text-sm">{saveSuccessMessage}</p>
                                 </div>
                             </div>
                         </div>
                    )}

                    <form onSubmit={handleSaveNameAndClave} className="space-y-6 p-6 md:p-8 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 shadow-lg">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-300 dark:border-slate-600 pb-3 mb-6">Información Principal y Clave del Widget</h2>
                        <div>
                            <label htmlFor="clientNameInput" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Nombre de tu Consulta / Negocio <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="clientNameInput"
                                id="clientNameInput"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                                placeholder="Ej: Clínica Quiropráctica Central"
                                disabled={saving}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="clientClaveInput" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Clave Secreta del Widget (Opcional)
                            </label>
                            <input
                                type="text"
                                name="clientClaveInput"
                                id="clientClaveInput"
                                value={clave}
                                onChange={(e) => setClave(e.target.value)}
                                className="mt-1 block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition sm:text-sm"
                                placeholder="Deja vacío si no usas (ej: miClaveSuperSegura123)"
                                disabled={saving}
                            />
                             <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Si defines una clave aquí, se incluirá en el script de integración. Mejora la seguridad de tu widget.</p>
                        </div>
                        <button
                            type="submit"
                            disabled={saving || pageSpecificLoading || contextClientDataLoading || !authenticatedClientIdFromContext}
                            className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                        >
                            {saving && <SpinnerIcon />}
                            <span className={saving ? "ml-2" : ""}>{saving ? "Guardando..." : "Guardar Nombre y Clave"}</span>
                        </button>
                    </form>

                    <section className="p-6 md:p-8 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 shadow-lg">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-300 dark:border-slate-600 pb-3">Tu Nuevo Código de Integración del Widget RigBot</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">Copia este script y pégalo justo antes de la etiqueta de cierre <code>&lt;/body&gt;</code> en tu sitio web.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Este script ahora carga el widget desde tu backend, incluyendo tu <code>clientId</code> y tu <code>clave</code> (si la definiste) de forma segura en la URL.</p>
                        <div className="relative bg-slate-800 text-white p-4 rounded-lg shadow-inner">
                            <button
                                onClick={handleCopy}
                                disabled={rigbotScript.startsWith("//")} 
                                className="absolute top-3 right-3 bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 px-3 rounded-md text-xs font-medium flex items-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Copiar código de integración"
                            >
                                {copyStatus === "idle" && <><ClipboardIcon /> Copiar Script</>}
                                {copyStatus === "success" && <><CheckCircleIcon className="w-4 h-4 inline mr-1 text-green-400" /> ¡Copiado!</>}
                                {copyStatus === "error" && <><ExclamationTriangleIcon className="w-4 h-4 inline mr-1 text-red-400" /> Error</>}
                            </button>
                            <pre className="overflow-x-auto whitespace-pre-wrap text-sm leading-relaxed">
                                {rigbotScript}
                            </pre>
                        </div>
                         {rigbotScript.startsWith("//") && (
                             <p className="mt-3 text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 p-2 rounded-md">
                                  <ExclamationTriangleIcon className="w-4 h-4 inline mr-1"/>
                                  {rigbotScript.substring(3)}
                             </p>
                        )}
                    </section>

                    <section className="p-6 md:p-8 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-700/30 shadow-lg">
                        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3">Integraciones Externas</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Conecta RigBot con otras herramientas para potenciar tu asistente virtual y automatizar tareas.
                        </p>
                        <div className="bg-white dark:bg-slate-700/50 p-6 rounded-lg border border-indigo-200 dark:border-indigo-600 shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex items-center mb-3">
                                 <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                     {/* Google Calendar Icon (simplified) */}
                                     <path d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20C3,21.1 3.89,22 5,22H19C20.1,22 21,21.1 21,20V6C21,4.9 20.1,4 19,4ZM19,20H5V10H19V20ZM19,8H5V6H19V8Z"></path>
                                 </svg>
                                 <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300">Google Calendar</h3>
                             </div>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                                  Permite que RigBot acceda a tu Google Calendar para consultar tu disponibilidad y, opcionalmente, agendar citas automáticamente (próximamente).
                             </p>
                             <Link 
                                 href="/client/calendar-integration" 
                                 className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-sm transition duration-150 ease-in-out text-sm"
                             >
                                 <CalendarIcon className="w-4 h-4 mr-2" />
                                 Gestionar Conexión con Google Calendar
                             </Link>
                        </div>
                    </section>
                    
                    {/* ===== MODIFICACIÓN AQUÍ: Sección de Otros Ajustes / Navegación ===== */}
                    <div className="mt-10 pt-8 border-t border-slate-300 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            
                        {/* Botón Configuración de Leads */}
                        <Link 
                            href="/client/lead-settings" 
                            className="w-full max-w-xs sm:max-w-none flex items-center justify-center px-6 py-3.5 border-2 border-sky-600 text-sky-700 dark:border-sky-500 dark:text-sky-300 font-semibold rounded-lg shadow-md hover:bg-sky-50 dark:hover:bg-sky-700/30 hover:border-sky-700 dark:hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition duration-150 ease-in-out"
                        >
                            <CogIcon className="w-5 h-5 mr-2" /> {/* Usando el CogIcon añadido */}
                            Configuración de Leads
                        </Link>

                        {/* Botón Configuración Avanzada del Chatbot */}
                        <Link 
                            href="/client/chatbot-settings" 
                            className="w-full max-w-xs sm:max-w-none flex items-center justify-center px-6 py-3.5 border-2 border-purple-600 text-purple-700 dark:border-purple-500 dark:text-purple-300 font-semibold rounded-lg shadow-md hover:bg-purple-50 dark:hover:bg-purple-700/30 hover:border-purple-700 dark:hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
                        >
                            <Cog8ToothIcon className="w-5 h-5 mr-2" />
                            Configuración Avanzada del Chatbot
                        </Link>
                        
                        {/* Botón Volver a la Página Principal */}
                        <Link 
                            href="/" 
                            className="w-full max-w-xs sm:max-w-none sm:col-span-2 lg:col-span-1 text-center text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline py-2"
                        >
                            Volver a la Página Principal
                        </Link>
                    </div>
                    {/* ===== FIN DE LA MODIFICACIÓN ===== */}
                </main>
                <footer className="text-center p-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
                    © {new Date().getFullYear()} RigBot Systems por RIGO. {'Tu asistente virtual inteligente.'}
                </footer>
            </div>
        </div>
    );
}