// src/app/logs/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react"; // Importado useCallback
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
  limit as firestoreLimit, // Renombrar para evitar conflicto con un posible 'limit' de JS
  Timestamp, // Importar Timestamp para tipado
} from "firebase/firestore";
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"; // Importar getApps, getApp y FirebaseApp

// Configuración de Firebase obtenida desde variables de entorno.
// ⚠️ Asegúrate de que estas variables de entorno estén configuradas en Vercel y en tu .env.local para desarrollo.
// Deben tener el prefijo NEXT_PUBLIC_ para ser accesibles en el cliente.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase de forma segura (evita re-inicializaciones)
// Esto asegura que la app de Firebase se inicialice solo una vez.
let app: FirebaseApp | undefined; // CORREGIDO: Tipado explícito para app
// Verifica que todas las variables de configuración necesarias estén presentes
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
      app = getApp(); // Si ya está inicializada, obtener la instancia existente
    }
} else {
    console.error("Firebase config is missing or incomplete. Check your environment variables.");
    // Podrías manejar este caso mostrando un error en la UI o deshabilitando la funcionalidad de Firebase.
}

const db = app ? getFirestore(app) : undefined; // 'app' podría ser undefined si la configuración no está completa, db también

// Definición de la interfaz para los logs, más específica
interface LogEntry {
  id: string;
  content: string;
  role: "user" | "assistant" | string; // Permitir otros roles si existen
  sessionId?: string;
  ip?: string;
  timestamp: Timestamp | number; // Puede ser un Timestamp de Firestore o un número (Date.now())
  [key: string]: unknown;
}

// Componentes de icono simples para botones (SVG)
const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);

export default function LogViewerPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string>("");
  const [filterSessionId, setFilterSessionId] = useState<string>("");
  const [logLimit, setLogLimit] = useState<number>(50);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    if (firebaseConfig.apiKey && app && db) { // Asegurarse que db también esté definido
        setIsFirebaseReady(true);
    } else {
        setError("La configuración de Firebase no está completa o Firebase no se pudo inicializar. Por favor, verifica las variables de entorno.");
        setLoading(false);
    }
  }, []);


  // Función para cargar los logs desde Firestore, envuelta en useCallback
  const fetchLogs = useCallback(async (currentLimit: number) => {
    if (!isFirebaseReady || !db) {
        setError("Firebase no está inicializado correctamente. No se pueden cargar los logs.");
        setLoading(false);
        return;
    }
    setLoading(true);
    setError(null);
    console.log(`Fetching ${currentLimit} logs...`);
    try {
      const logsRef = collection(db, "rigbot_logs");
      const q = query(
        logsRef,
        orderBy("timestamp", "desc"),
        firestoreLimit(currentLimit)
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp,
        } as LogEntry;
      });
      console.log(`Fetched ${results.length} logs successfully.`);
      setLogs(results);
    } catch (err: unknown) {
      console.error("Error fetching logs from Firestore:", err);
      let errorMessage = "Error desconocido. Revisa la consola para más detalles.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(`Error al cargar los logs: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [isFirebaseReady]); // db no es necesario como dependencia si es estable tras la inicialización

  // useEffect para cargar los logs cuando el componente se monta o cambia el límite, y Firebase está listo
  useEffect(() => {
    if (isFirebaseReady) {
        fetchLogs(logLimit);
    }
  }, [logLimit, isFirebaseReady, fetchLogs]); // CORREGIDO: Añadido fetchLogs a las dependencias

  const handleRefresh = () => {
    if (isFirebaseReady) {
        fetchLogs(logLimit);
    } else {
        setError("Firebase no está listo. No se pueden actualizar los logs.");
    }
  };

  // Filtrar logs basado en los estados de filtro usando useMemo para optimización
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const roleMatch = filterRole ? log.role === filterRole : true;
      const sessionMatch = filterSessionId
        ? log.sessionId?.toLowerCase().includes(filterSessionId.toLowerCase())
        : true;
      return roleMatch && sessionMatch;
    });
  }, [logs, filterRole, filterSessionId]);

  // Función para formatear el timestamp a un string legible
  const formatTimestamp = (timestamp: Timestamp | number | undefined): string => {
    if (!timestamp) return "-";
    let date: Date;
    if (typeof timestamp === "object" && "toDate" in timestamp) {
      date = timestamp.toDate();
    } else if (typeof timestamp === "number") {
      date = new Date(timestamp);
    } else {
      return "Fecha inválida";
    }
    return date.toLocaleString("es-CL", {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
  };

  // Función para convertir los datos de logs a formato CSV
  const convertToCSV = (data: LogEntry[]) => {
    if (!data || data.length === 0) return "";
    const headers = ["ID Documento", "Rol", "Contenido", "Session ID", "IP", "Timestamp (es-CL)"];
    const csvRows = [headers.join(",")];
    data.forEach((log) => {
      const row = [
        `"${log.id || ""}"`,
        `"${log.role || ""}"`,
        `"${(log.content || "").replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
        `"${log.sessionId || ""}"`,
        `"${log.ip || ""}"`,
        `"${formatTimestamp(log.timestamp) || ""}"`,
      ];
      csvRows.push(row.join(","));
    });
    return csvRows.join("\n");
  };

  // Manejador para la exportación a CSV
  const handleExportCSV = () => {
    if (!isFirebaseReady) {
        alert("Firebase no está listo. No se pueden exportar los logs.");
        return;
    }
    const csvData = convertToCSV(filteredLogs);
    if (csvData) {
      const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute("download", `rigbot_logs_${dateStr}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } else {
      alert("No hay datos para exportar o ha ocurrido un error al generar el CSV.");
    }
  };

  // Renderizado del componente
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
          📝 Visor de Logs de RigBot
        </h1>
        <p className="text-slate-600 mt-2 text-base md:text-lg">
          Explora las últimas interacciones y eventos registrados en Firestore.
        </p>
      </header>

      {/* Sección de Controles y Filtros */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="filterRole" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Rol:</label>
                <select
                    id="filterRole"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-150"
                    disabled={!isFirebaseReady || loading}
                >
                    <option value="">Todos</option>
                    <option value="user">Usuario (user)</option>
                    <option value="assistant">Asistente (assistant)</option>
                </select>
            </div>
            <div>
                <label htmlFor="filterSessionId" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por Session ID:</label>
                <input
                    type="text"
                    id="filterSessionId"
                    placeholder="Parte del Session ID..."
                    value={filterSessionId}
                    onChange={(e) => setFilterSessionId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-150"
                    disabled={!isFirebaseReady || loading}
                />
            </div>
             <div>
                <label htmlFor="logLimit" className="block text-sm font-medium text-slate-700 mb-1">Mostrar Logs:</label>
                <select
                    id="logLimit"
                    value={logLimit}
                    onChange={(e) => setLogLimit(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-150"
                    disabled={!isFirebaseReady || loading}
                >
                    <option value={25}>Últimos 25</option>
                    <option value={50}>Últimos 50</option>
                    <option value={100}>Últimos 100</option>
                    <option value={200}>Últimos 200</option>
                    <option value={500}>Últimos 500</option>
                </select>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:col-span-2 lg:col-span-1 lg:justify-self-end">
                <button
                    onClick={handleRefresh}
                    disabled={!isFirebaseReady || loading}
                    title="Actualizar lista de logs"
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-opacity duration-150"
                >
                    <RefreshIcon />
                    {loading ? "Cargando..." : "Actualizar"}
                </button>
                <button
                    onClick={handleExportCSV}
                    disabled={!isFirebaseReady || loading || filteredLogs.length === 0}
                    title="Exportar los logs filtrados a un archivo CSV"
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 transition-opacity duration-150"
                >
                    <DownloadIcon />
                    Exportar CSV
                </button>
            </div>
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md shadow" role="alert">
          <p className="font-semibold">¡Ups! Algo salió mal:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Indicador de Carga o Tabla de Logs */}
      {!isFirebaseReady && !loading && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md p-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-20 h-20 text-amber-500 mx-auto mb-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-slate-700 text-xl font-semibold">Configuración de Firebase Incompleta</p>
            <p className="text-sm text-slate-500 mt-2">Por favor, asegúrate de que las variables de entorno de Firebase (NEXT_PUBLIC_FIREBASE_...) estén correctamente configuradas.</p>
        </div>
      )}

      {isFirebaseReady && loading && (
        <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-5 text-lg">Cargando logs, un momento por favor...</p>
        </div>
      )}
      
      {isFirebaseReady && !loading && filteredLogs.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md p-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-slate-400 mx-auto mb-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-slate-500 text-xl">No se encontraron logs.</p>
            {logs.length > 0 && (
                 <p className="text-sm text-slate-400 mt-2">Intenta ajustar los filtros o presiona &quot;Actualizar&quot;.</p>
            )}
             {logs.length === 0 && (
                 <p className="text-sm text-slate-400 mt-2">Parece que aún no hay logs registrados en la base de datos.</p>
            )}
        </div>
      )}
      
      {isFirebaseReady && !loading && filteredLogs.length > 0 && !error && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
          <table className="min-w-full text-sm divide-y divide-slate-200">
            <thead className="bg-slate-200 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Rol
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider" style={{minWidth: '300px', maxWidth: '600px'}}>
                  Contenido del Mensaje
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Session ID
                </th>
                <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors duration-150 ease-in-out">
                  <td className="px-5 py-4 whitespace-nowrap text-slate-700 align-top">
                    {formatTimestamp(log.timestamp)}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap align-top">
                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.role === "user"
                          ? "bg-sky-100 text-sky-800 border border-sky-300"
                          : log.role === "assistant"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-800 border border-slate-300"
                      }`}
                    >
                      {log.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-pre-wrap break-words text-slate-800 align-top" style={{minWidth: '300px', maxWidth: '600px'}}>
                    {log.content}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-mono text-xs align-top">
                    {log.sessionId || "-"}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-slate-500 font-mono text-xs align-top">
                    {log.ip || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <footer className="mt-12 text-center text-sm text-slate-500 py-4 border-t border-slate-200">
        <p>&copy; {new Date().getFullYear()} RigBot Log System. Creado con cariño para Rigquiropráctico.</p>
        <p>Inspirado por el gran Rigo y el &quot;codificador estrella&quot; Gemini. ✨</p>
      </footer>
    </div>
  );
}
