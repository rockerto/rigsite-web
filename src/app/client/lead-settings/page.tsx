// rigsite-fixed/app/client/lead-settings/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import type { FirebaseApp } from "firebase/app";
import { initializeApp, getApps, getApp } from "firebase/app";
import Link from 'next/link';
import { useUser } from "@/context/UserContext"; // Asumiendo que tu UserContext está en esta ruta

// --- ICONOS (similares a los que usas, puedes reemplazarlos con Lucide si prefieres) ---
const CheckCircleIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);
const ExclamationTriangleIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.031-1.742 3.031H4.42c-1.526 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
);
const SpinnerIcon = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white -ml-1 mr-3"></div>
);
const ArrowLeftIcon = ({ className = "w-5 h-5 mr-2" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
);
const CogIcon = ({ className = "w-6 h-6 mr-2" }: { className?: string }) => ( // Un icono genérico de configuración
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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

const isValidConfig = firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId;

let appClient: FirebaseApp | null = null;
if (isValidConfig) {
    if (!getApps().length) {
        appClient = initializeApp(firebaseConfig);
    } else {
        appClient = getApp();
    }
} else {
    console.error("Lead Settings Page: Firebase config is missing or incomplete. dbFs will be undefined.");
}

const dbFs = appClient ? getFirestore(appClient) : undefined;

export default function LeadSettingsPage() {
    const { user, clientId: authenticatedClientId, firebaseAuthLoading, clientDataLoading: contextClientDataLoading } = useUser();

    // Estados para los campos de configuración de leads
    const [leadCaptureEnabled, setLeadCaptureEnabled] = useState(false);
    const [clinicNameForLeadPrompt, setClinicNameForLeadPrompt] = useState("");
    const [leadNotificationEmail, setLeadNotificationEmail] = useState("");
    
    const [clientNameForDisplay, setClientNameForDisplay] = useState(""); // Para el saludo

    // Estados de UI
    const [pageLoading, setPageLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

    const fetchLeadSettingsData = useCallback(async () => {
        if (!dbFs) {
            setError("Error: No se pudo inicializar la conexión con Firestore. Revisa la configuración de Firebase.");
            setPageLoading(false);
            return;
        }
        if (!user || !authenticatedClientId) {
            setPageLoading(false);
            return;
        }

        setPageLoading(true);
        setError(null);
        setSaveSuccessMessage(null);

        try {
            const clientDocRef = doc(dbFs, "clients", authenticatedClientId);
            const clientDocSnap = await getDoc(clientDocRef);

            if (clientDocSnap.exists()) {
                const data = clientDocSnap.data();
                setLeadCaptureEnabled(data.leadCaptureEnabled === true); // Asegurar que sea booleano
                setClinicNameForLeadPrompt(data.clinicNameForLeadPrompt || data.name || ""); // Usar nombre de clínica si existe
                setLeadNotificationEmail(data.leadNotificationEmail || user.email || ""); // Default al email del usuario
                setClientNameForDisplay(data.name || user.displayName || "Cliente");
            } else {
                // Valores por defecto si no hay datos previos
                setLeadCaptureEnabled(false);
                setClinicNameForLeadPrompt(user.displayName || "Mi Clínica");
                setLeadNotificationEmail(user.email || "");
                setClientNameForDisplay(user.displayName || "Cliente Nuevo");
            }
        } catch (err) {
            console.error("Lead Settings Page: Error fetching lead settings:", err);
            const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido al cargar.";
            setError(`Error al cargar la configuración de leads: ${errorMessage}`);
        } finally {
            setPageLoading(false);
        }
    }, [authenticatedClientId, user]);

    useEffect(() => {
        if (firebaseAuthLoading || contextClientDataLoading) {
            setPageLoading(true);
            return;
        }
        if (user && authenticatedClientId) {
            if (!dbFs) {
                setError("Error: Configuración de Firebase incompleta. No se pueden cargar los datos.");
                setPageLoading(false);
                return;
            }
            fetchLeadSettingsData();
        } else {
            setPageLoading(false); // No user or clientID after context is loaded
        }
    }, [fetchLeadSettingsData, user, authenticatedClientId, firebaseAuthLoading, contextClientDataLoading]);

    const handleSaveLeadSettings = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dbFs) {
            setError("Error: No se pudo inicializar la conexión con Firestore para guardar.");
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
            leadCaptureEnabled,
            clinicNameForLeadPrompt,
            leadNotificationEmail,
        };

        try {
            const clientDocRef = doc(dbFs, "clients", authenticatedClientId);
            await setDoc(clientDocRef, settingsToSave, { merge: true });
            setSaveSuccessMessage("¡Configuración de leads guardada exitosamente!");
        } catch (err) {
            console.error("Lead Settings Page: Error saving lead settings:", err);
            const errorMessage = err instanceof Error ? err.message : "Ocurrió un error desconocido al guardar.";
            setError(`Error al guardar la configuración de leads: ${errorMessage}`);
        } finally {
            setSaving(false);
            setTimeout(() => setSaveSuccessMessage(null), 4000);
        }
    };

    // --- RENDER LOGIC (Loading, No User, etc.) ---
    if (firebaseAuthLoading || contextClientDataLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600 mx-auto"></div>
                <p className="text-slate-600 mt-4 text-lg">Cargando datos de usuario...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold text-red-600 mb-2">Acceso Denegado</h2>
                <p className="text-slate-700 max-w-md mb-4">Debes iniciar sesión para acceder a esta configuración.</p>
                <Link href="/client/login" className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition">
                    Ir a Login
                </Link>
            </div>
        );
    }
    
    if (!dbFs && !pageLoading) {
         return (
             <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
                 <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
                 <h2 className="text-xl font-semibold text-red-600 mb-2">Error de Configuración de Firebase</h2>
                 <p className="text-slate-700 max-w-md">No se pudo inicializar la conexión con la base de datos. Verifica las variables de Firebase.</p>
             </div>
         );
    }

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600 mx-auto"></div>
                <p className="text-slate-600 mt-4 text-lg">Cargando configuración de leads...</p>
            </div>
        );
    }

    // --- MAIN PAGE CONTENT ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center py-10 px-4 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
                <header className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white p-6 md:p-8 text-center">
                    <h1 className="text-3xl font-bold flex items-center justify-center">
                        <CogIcon className="w-8 h-8 mr-3" />Configuración de Captura de Leads
                    </h1>
                    {clientNameForDisplay && <p className="text-sky-100 mt-1">Para: {clientNameForDisplay}</p>}
                </header>

                <div className="p-6 md:p-10">
                    {error && (
                        <div className="flex items-center p-3 mb-6 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm shadow-md">
                            <ExclamationTriangleIcon className="text-red-500"/> <span>{error}</span>
                        </div>
                    )}
                    {saveSuccessMessage && (
                        <div className="flex items-center p-3 mb-6 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm shadow-md">
                            <CheckCircleIcon className="text-green-500"/> <span>{saveSuccessMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleSaveLeadSettings} className="space-y-8">
                        {/* Sección de Activación */}
                        <section>
                            <h3 className="text-lg font-semibold text-slate-700 mb-1">Activar Captura de Leads</h3>
                            <p className="text-xs text-slate-500 mb-3">Habilita esta opción para que RigBot intente capturar datos de contacto de nuevos prospectos.</p>
                            <label htmlFor="leadCaptureEnabled" className="flex items-center p-4 border border-slate-300 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="leadCaptureEnabled"
                                    checked={leadCaptureEnabled}
                                    onChange={(e) => setLeadCaptureEnabled(e.target.checked)}
                                    className="h-5 w-5 text-sky-600 border-slate-400 rounded focus:ring-sky-500 focus:ring-2 transition"
                                    disabled={saving}
                                />
                                <span className="ml-3 text-sm font-medium text-slate-700">
                                    {leadCaptureEnabled ? "Captura de Leads ACTIVADA" : "Captura de Leads DESACTIVADA"}
                                </span>
                            </label>
                        </section>

                        {/* Sección de Personalización de Prompts y Notificación */}
                        {leadCaptureEnabled && ( // Mostrar solo si la captura está activada
                            <>
                                <section>
                                    <label htmlFor="clinicNameForLeadPrompt" className="block text-sm font-semibold text-slate-700 mb-1">
                                        Nombre de tu Clínica (para el bot)
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">Este nombre usará el bot al ofrecer la captura de leads (Ej: "para Clínica Dental Sonrisas").</p>
                                    <input
                                        id="clinicNameForLeadPrompt"
                                        type="text"
                                        value={clinicNameForLeadPrompt}
                                        onChange={(e) => setClinicNameForLeadPrompt(e.target.value)}
                                        placeholder="Ej: Clínica del Pirata Feliz"
                                        className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                        disabled={saving}
                                    />
                                </section>

                                <section>
                                    <label htmlFor="leadNotificationEmail" className="block text-sm font-semibold text-slate-700 mb-1">
                                        Email para Recibir Notificaciones de Leads
                                    </label>
                                    <p className="text-xs text-slate-500 mb-2">A esta dirección de correo se enviarán los detalles de cada lead capturado.</p>
                                    <input
                                        id="leadNotificationEmail"
                                        type="email"
                                        value={leadNotificationEmail}
                                        onChange={(e) => setLeadNotificationEmail(e.target.value)}
                                        placeholder="tuemail@ejemplo.com"
                                        className="mt-1 block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                                        disabled={saving}
                                        required
                                    />
                                </section>
                            </>
                        )}
                        
                        <div className="flex flex-col sm:flex-row gap-4 mt-10 pt-6 border-t border-slate-200">
                            <button
                                type="submit"
                                disabled={saving || pageLoading || firebaseAuthLoading || contextClientDataLoading}
                                className="w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                            >
                                {saving ? <SpinnerIcon /> : <CheckCircleIcon className="text-white"/>}
                                {saving ? "Guardando Cambios..." : "Guardar Configuración de Leads"}
                            </button>
                            <Link href="/client" legacyBehavior>
                                <a className="w-full sm:w-auto flex items-center justify-center px-6 py-3.5 border border-slate-300 text-base font-semibold rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out">
                                    <ArrowLeftIcon /> Volver al Panel Principal
                                </a>
                            </Link>
                        </div>
                    </form>
                    <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
                        <p>© {new Date().getFullYear()} RigBot Systems. Configuración de Captura de Leads.</p>
                    </footer>
                </div>
            </div>
        </div>
    );
}