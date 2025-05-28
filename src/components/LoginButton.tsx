// src/components/LoginButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User,
  signOut,
  getAuth, 
  Auth 
} from "firebase/auth"; 
import { app as firebaseApp } from "@/lib/firebase"; 
import Link from 'next/link'; // Para el botón "Ir a tu Panel"

// Icono de Google
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);

// Spinner para botones
const ButtonSpinner = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

console.log("LoginButton.tsx: Módulo cargado. Valor de firebaseApp de lib/firebase:", firebaseApp);

export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [loadingInitialAuth, setLoadingInitialAuth] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    console.log("LoginButton useEffect: Verificando firebaseApp:", firebaseApp);
    if (firebaseApp) {
      try {
        const auth = getAuth(firebaseApp);
        setAuthInstance(auth);
        console.log("LoginButton useEffect: Instancia de Firebase Auth obtenida y asignada a authInstance.");
        
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          console.log("LoginButton onAuthStateChanged: currentUser:", currentUser?.uid || "ninguno");
          setUser(currentUser);
          setLoadingInitialAuth(false);
          if (currentUser) {
            console.log("LoginButton onAuthStateChanged: Usuario ya logueado:", currentUser.displayName || currentUser.email);
          }
        },(error) => {
          console.error("LoginButton onAuthStateChanged: Error en el listener:", error);
          setAuthError("Error al verificar estado de autenticación.");
          setLoadingInitialAuth(false);
        });
        return () => {
          console.log("LoginButton useEffect: Desuscribiendo de onAuthStateChanged.");
          unsubscribe();
        };
      } catch (e) {
        console.error("LoginButton useEffect: Error al llamar a getAuth(firebaseApp):", e);
        setAuthError("Error crítico al inicializar servicio de autenticación.");
        setLoadingInitialAuth(false);
      }
    } else {
      console.error("LoginButton useEffect: firebaseApp de lib/firebase es null o undefined. No se puede inicializar Auth.");
      setAuthError("Error crítico: Aplicación Firebase no disponible.");
      setLoadingInitialAuth(false);
    }
  }, []);

  const handleGoogleLogin = async () => {
    console.log("handleGoogleLogin: Intentando iniciar sesión...");
    console.log("handleGoogleLogin: authInstance actual:", authInstance);

    if (!authInstance) {
      console.error("handleGoogleLogin: authInstance NO está lista. Abortando login.");
      setAuthError("El servicio de autenticación no está listo. Por favor, espera un momento o recarga la página.");
      setActionLoading(false);
      return;
    }

    const provider = new GoogleAuthProvider();
    console.log("handleGoogleLogin: GoogleAuthProvider creado:", provider);
    setAuthError(null);
    setActionLoading(true);
    
    try {
      console.log("handleGoogleLogin: Llamando a signInWithPopup con authInstance y provider.");
      const result = await signInWithPopup(authInstance, provider);
      console.log("Login exitoso:", result.user.displayName || result.user.email);
      window.location.href = '/client'; 
    } catch (error) { 
      console.error("Error detallado durante el login con Google:", error);
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        const firebaseError = error as { code: string; message: string };
        if (firebaseError.code === 'auth/popup-closed-by-user') {
          setAuthError("El proceso de inicio de sesión fue cancelado.");
        } else if (firebaseError.code === 'auth/cancelled-popup-request') {
           setAuthError("Se canceló la solicitud de inicio de sesión múltiple. Por favor, intenta de nuevo.");
        } else {
          setAuthError(`Error (${firebaseError.code}): ${firebaseError.message}`);
        }
      } else if (error instanceof Error) {
        setAuthError(error.message || "Ocurrió un error durante el inicio de sesión.");
      } else {
        setAuthError("Ocurrió un error desconocido durante el inicio de sesión.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!authInstance) {
      console.error("handleLogout: authInstance NO está lista.");
      setAuthError("El servicio de autenticación no está listo.");
      return;
    }
    setAuthError(null);
    setActionLoading(true);
    try {
      await signOut(authInstance);
      console.log("Logout exitoso.");
    } catch (error) {
      console.error("Error durante el logout:", error);
      const typedError = error as {code?: string, message?: string};
      setAuthError(`Error al cerrar sesión: ${typedError.message || "Error desconocido"}`);
    } finally {
      setActionLoading(false);
    }
  };

  // --- INICIO DE CORRECCIONES EN JSX DE RETURN ---
  if (loadingInitialAuth) { 
    return (
      <div className="flex items-center justify-center p-2 text-sm text-slate-500">
        <ButtonSpinner />
        <span>Verificando autenticación...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="text-center space-y-4 w-full">
        <p className="text-slate-700 dark:text-slate-300 text-sm">
          ¡Conectado como <span className="font-semibold">{user.displayName || user.email}!</span>
        </p>
        <Link 
          href="/client"
          className="block w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
        >
          Ir a tu Panel
        </Link>
        <button
          onClick={handleLogout}
          disabled={actionLoading || !authInstance}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition duration-150 ease-in-out disabled:opacity-50"
        >
          {actionLoading && <ButtonSpinner />}
          Cerrar Sesión
        </button>
        {authError && <p className="mt-2 text-xs text-red-600">{authError}</p>}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleGoogleLogin}
        disabled={actionLoading || !authInstance} 
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-base font-medium rounded-md shadow-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-60"
      >
        {actionLoading ? (
          <ButtonSpinner />
        ) : (
          <GoogleIcon />
        )}
        {actionLoading ? "Procesando..." : "Iniciar Sesión con Google"}
      </button>
      {authError && <p className="mt-4 text-sm text-red-600">{authError}</p>}
      {!authInstance && !loadingInitialAuth && (
        <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
          El servicio de autenticación no está disponible. Revisa tu configuración de Firebase o inténtalo más tarde.
        </p>
      )}
    </>
  );
  // --- FIN DE CORRECCIONES EN JSX DE RETURN ---
}