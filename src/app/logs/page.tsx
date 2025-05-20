"use client";
import { useState } from "react";
import LogViewerPage from "./LogViewerReal";

export default function ProtectedLogsPage() {
  const [accessGranted, setAccessGranted] = useState(false);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === "superrigo") { // Cambia esta clave como quieras
      setAccessGranted(true);
    } else {
      alert("Clave incorrecta");
    }
  };

  if (accessGranted) {
    return <LogViewerPage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md max-w-sm w-full text-center">
        <h1 className="text-xl font-bold mb-4">🔒 Acceso Restringido</h1>
        <input
          type="password"
          placeholder="Ingresa la clave"
          className="border border-gray-300 rounded w-full px-3 py-2 mb-4 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Entrar
        </button>
        <p className="text-xs text-gray-500 mt-2">Solo para administradores</p>
      </form>
    </div>
  );
}
