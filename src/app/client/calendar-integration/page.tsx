// src/app/client/calendar-integration/page.tsx
"use client";
import Link from "next/link";
import { useUser } from "@/context/UserContext"; // Asegúrate que la ruta sea correcta
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase"; // <--- IMPORTANTE: Importar auth de Firebase
import { ArrowLeftIcon, AlertTriangleIcon } from "lucide-react"; // Usar AlertTriangleIcon para el botón de desconectar

// --- ICONOS REUTILIZADOS (o usa los tuyos) ---
const SpinnerIcon = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-600"></div>
);
const CheckCircleIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
);
const ExclamationTriangleIcon = ({ className = "w-6 h-6" }) => ( // Para errores generales
  <svg className={className} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.216 3.031-1.742 3.031H4.42c-1.526 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
);
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function CalendarIntegrationPage() {
  // Asumo que refreshClientData es una función de tu UserContext para recargar los datos del cliente
  const { user, clientData, firebaseAuthLoading, clientDataLoading, refreshClientData } = useUser(); 
  
  // No necesitamos un estado local 'isConnected' si clientData lo provee directamente.
  // const [isConnected, setIsConnected] = useState(false); 
  const [generalError, setGeneralError] = useState<string | null>(null); // Renombrado para claridad
  const [actionLoading, setActionLoading] = useState(false); // Para ambos botones
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // useEffect(() => {
  //   if (clientData) { // No necesitamos setIsConnected si usamos clientData directamente
  //     // setIsConnected(clientData.googleCalendarConnected || false); 
  //     // Limpiar mensajes al cargar datos nuevos
  //     setGeneralError(null);
  //     setSuccessMessage(null);
  //   }
  // }, [clientData]);

  const isCalendarConnected = clientData?.googleCalendarConnected || false;
  const connectedEmail = clientData?.googleCalendarEmail || '';


  const handleConnect = async () => {
    setActionLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);
    try {
      const rigbotProductBaseUrl = process.env.NEXT_PUBLIC_RIGBOT_PRODUCT_URL;
      if (!rigbotProductBaseUrl) {
        console.error("CalendarIntegrationPage: NEXT_PUBLIC_RIGBOT_PRODUCT_URL no está configurada.");
        setGeneralError("Error de configuración del sistema.");
        setActionLoading(false);
        return;
      }
      if (!user?.uid) { // user viene de useUser()
        console.error("CalendarIntegrationPage: UID del usuario no disponible para iniciar OAuth.");
        setGeneralError("Error de autenticación: No se pudo obtener la información del usuario.");
        setActionLoading(false);
        return;
      }
      // La redirección se encarga, no necesitamos setActionLoading(false) aquí.
      window.location.href = `${rigbotProductBaseUrl}/api/auth/google/initiate?userId=${user.uid}`;
    } catch (e) {
      const error = e as Error;
      console.error("Error iniciando conexión con Google Calendar:", error);
      setGeneralError(error.message || "Error desconocido al iniciar la conexión.");
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("¿Estás seguro de que quieres desconectar tu calendario de Google? RigBot ya no podrá acceder a tu disponibilidad.")) {
      return;
    }

    setActionLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);

    if (!auth.currentUser) { // Usar la instancia de auth importada
      setGeneralError("No estás autenticado. Por favor, inicia sesión de nuevo.");
      setActionLoading(false);
      return;
    }

    try {
      const idToken = await auth.currentUser.getIdToken(true); // Forzar refresco del token
      const rigbotProductBaseUrl = process.env.NEXT_PUBLIC_RIGBOT_PRODUCT_URL;
      if (!rigbotProductBaseUrl) {
        throw new Error("La URL del servicio de RigBot no está configurada.");
      }

      const response = await fetch(`${rigbotProductBaseUrl}/api/auth/google/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Calendario desconectado exitosamente.");
        if (typeof refreshClientData === 'function') {
          await refreshClientData(); // ¡Importante! Refrescar los datos del cliente
        } else {
          // Si no hay refreshClientData, al menos intentamos forzar un reload de la página
          // para que vea los cambios, aunque es menos ideal.
          console.warn("refreshClientData no está disponible en UserContext, recargando página...");
          window.location.reload();
        }
      } else {
        setGeneralError(data.error || "Ocurrió un error al desconectar el calendario.");
      }
    } catch (error) {
      console.error("Error de red o fetch al desconectar:", error);
      const e = error as Error;
      setGeneralError(e.message || "Error de conexión al intentar desconectar el calendario. Intenta de nuevo.");
    } finally {
      setActionLoading(false);
    }
  };

  if (firebaseAuthLoading || clientDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-700 bg-slate-100">
        <SpinnerIcon />
        <span className="ml-3">Cargando datos...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center text-slate-700 p-6">
        <ExclamationTriangleIcon className="text-red-700 w-6 h-6" />
        <h1 className="mt-4 text-xl font-semibold text-red-700">Acceso Denegado</h1>
        <p className="text-sm mt-1">Debes iniciar sesión para poder conectar tu calendario.</p>
        <Link href="/client/login" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">
          Ir al Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-8 md:p-10">
        <Link href="/client" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-6 group">
          <ArrowLeftIcon className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          Volver al Panel Principal
        </Link>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3 text-center">Conectar tu Google Calendar</h1>
        
        {isCalendarConnected ? (
            <p className="text-sm mb-2 text-center text-slate-600">
                Conectado como: <strong className="text-indigo-700">{connectedEmail}</strong>
            </p>
        ) : (
            <p className="text-sm mb-8 text-center text-slate-600">
                Permite que Rigbot acceda a tu calendario para verificar tu disponibilidad.
            </p>
        )}


        {generalError && (
          <div className="flex items-center gap-2 p-3 my-4 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm shadow-md">
            <ExclamationTriangleIcon className="text-red-700 w-5 h-5" /> 
            <span>{generalError}</span>
          </div>
        )}
        {successMessage && !generalError && (
            <div className="flex items-center justify-center gap-2 p-3 my-4 bg-green-50 border border-green-300 text-green-800 rounded-lg text-sm shadow-sm">
                <CheckCircleIcon className="text-green-600 w-5 h-5" />
                <span>{successMessage}</span>
            </div>
        )}

        {isCalendarConnected ? (
          <div className="space-y-4 text-center mt-6">
            <button
              onClick={handleDisconnect}
              disabled={actionLoading}
              className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50"
            >
              {actionLoading && <SpinnerIcon />}
              {!actionLoading && <AlertTriangleIcon className="text-white w-5 h-5" />} {/* Icono para desconectar */}
              {actionLoading ? "Desconectando..." : "Desconectar Calendario"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={actionLoading}
            className="w-full flex justify-center items-center gap-3 px-6 py-3 border border-slate-300 hover:border-slate-400 bg-white text-slate-700 hover:bg-slate-50 font-medium rounded-lg shadow-md transition disabled:opacity-50 mt-6"
          >
            {actionLoading && <SpinnerIcon />}
            {!actionLoading && <GoogleIcon />}
            {actionLoading ? "Redirigiendo a Google..." : "Conectar con Google Calendar"}
          </button>
        )}
        <p className="text-xs text-slate-500 mt-6 text-center">
          Al conectar tu calendario, aceptas que Rigbot acceda a la información de tus eventos para verificar disponibilidad. Solo se usará para leer eventos y no se modificarán tus datos.
        </p>
      </div>
      <p className="text-xs text-slate-500 mt-8 text-center">&copy; {new Date().getFullYear()} RigBot Systems</p>
    </div>
  );
}