// src/components/LoginButton.tsx
"use client";

import { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged, 
  User,
  signOut // <--- IMPORTAR signOut
} from "firebase/auth"; 
import { auth } from "@/lib/firebase"; 

// Icono de Google (se mantiene igual)
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function LoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Para el estado inicial de carga de auth
  const [actionLoading, setActionLoading] = useState(false); // Para el spinner del botón de login/logout
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        console.log("LoginButton: Usuario ya logueado:", currentUser.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError(null);
    setActionLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user); // Actualizar el estado local inmediatamente
      console.log("Login exitoso:", result.user.displayName);
      window.location.href = '/client'; // Redirigir al panel principal del cliente
    } catch (error) { 
      console.error("Error durante el login con Google:", error);
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        const firebaseError = error as { code: string; message: string };
        setAuthError(`Error (${firebaseError.code}): ${firebaseError.message}`);
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
    setAuthError(null);
    setActionLoading(true);
    try {
      await signOut(auth);
      setUser(null); // Limpiar el estado del usuario
      console.log("Logout exitoso.");
      // Opcional: redirigir a la página de login o a la home
      // window.location.href = '/client/login'; 
    } catch (error) {
      console.error("Error durante el logout:", error);
      if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error) {
        const firebaseError = error as { code: string; message: string };
        setAuthError(`Error de Firebase al cerrar sesión: ${firebaseError.message}`);
      } else if (error instanceof Error) {
        setAuthError(error.message || "Ocurrió un error al cerrar la sesión.");
      } else {
        setAuthError("Ocurrió un error desconocido al cerrar la sesión.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) { 
    return <p className="text-slate-500">Cargando estado de autenticación...</p>;
  }

  if (user) {
    return (
      <div className="text-center space-y-4">
        <p className="text-slate-700">¡Conectado como {user.displayName || user.email}!</p>
        <a 
          href="/client"
          className="block w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
        >
          Ir a tu Panel
        </a>
        <button
          onClick={handleLogout}
          disabled={actionLoading}
          className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition duration-150 ease-in-out disabled:opacity-50"
        >
          {actionLoading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Cerrar Sesión
        </button>
        {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
      </div>
    );
  }

  // Si no hay usuario, mostrar botón de login
  return (
    <>
      <button
        onClick={handleGoogleLogin}
        disabled={actionLoading}
        className="w-full inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50"
      >
        {actionLoading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <GoogleIcon />
        )}
        {actionLoading ? "Procesando..." : "Iniciar Sesión con Google"}
      </button>
      {authError && <p className="mt-4 text-sm text-red-600">{authError}</p>}
    </>
  );
}