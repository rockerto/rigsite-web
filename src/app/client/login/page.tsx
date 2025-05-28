// src/app/client/login/page.tsx
"use client";

import LoginButton from "@/components/LoginButton"; // Asumimos que este componente ya existe o lo crearás

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 p-6 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          Bienvenido a tu Panel Rigbot 🚀
        </h1>
        <p className="text-slate-600 mb-8 text-base sm:text-lg">
          Inicia sesión para administrar la configuración de tu asistente virtual.
        </p>
        <LoginButton />
        <p className="mt-8 text-xs text-slate-500">
          Al iniciar sesión, aceptas nuestros términos y condiciones.
        </p>
      </div>
      <footer className="absolute bottom-4 text-xs text-slate-500">
        © {new Date().getFullYear()} RigBot Systems. Tu asistente inteligente.
      </footer>
    </div>
  );
}