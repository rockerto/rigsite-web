// src/app/logs/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
  limit as firestoreLimit, // Renombrar para evitar conflicto con un posible 'limit' de JS
  Timestamp, // Importar Timestamp para tipado
} from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app"; // Importar getApps y getApp para inicialización segura

// Tus credenciales de Firebase.
// ⚠️ ¡ADVERTENCIA DE SEGURIDAD! Mover a variables de entorno es altamente recomendado.
// Ejemplo: const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const firebaseConfig = {
  apiKey: "AIzaSyDzSmncR0p1YIA5Kb9ZucNdhyUpl6iC2LI",
  authDomain: "rigbot-1.firebaseapp.com",
  projectId: "rigbot-1",
  storageBucket: "rigbot-1.appspot.com",
  messagingSenderId: "340894665323",
  appId: "1:340894665323:web:cd36f46df3dfeac1157f2e",
};

// Inicializar Firebase de forma segura (evita re-inicializaciones)
// Esto asegura que la app de Firebase se inicialice solo una vez.
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Si ya está inicializada, obtener la instancia existente
}
const db = getFirestore(app);

// Definición de la interfaz para los logs, más específica
interface LogEntry {
  id: string;
  content: string;
  role: "user" | "assistant" | string; // Permitir otros roles si existen
  sessionId?: string;
  ip?: string;
  timestamp: Timestamp | number; // Puede ser un Timestamp de Firestore o un número (Date.now())
  [key: string]: any; // Para otros campos que puedan existir
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
  const [filterRole, setFilterRole] = useState<string>(""); // Para filtrar por rol
  const [filterSessionId, setFilterSessionId] = useState<string>(""); // Para filtrar por sessionId
  const [logLimit, setLogLimit] = useState<number>(50); // Para configurar el límite de logs

  // Función para cargar los logs desde Firestore
  const fetchLogs = async (currentLimit: number) => {
    setLoading(true);
    setError(null);
    console.log(`Fetching ${currentLimit} logs...`); // Log para depuración
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
          timestamp: data.timestamp, // El timestamp ya viene de Firestore
        } as LogEntry;
      });
      console.log(`Fetched ${results.length} logs successfully.`); // Log para depuración
      setLogs(results);
    } catch (err: any) {
      console.error("Error fetching logs from Firestore:", err); // Log de error más detallado
      setError(
        `Error al cargar los logs: ${err.message || "Error desconocido. Revisa la consola para más detalles."}`
      );
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar los logs cuando el componente se monta o cambia el límite
  useEffect(() => {
    fetchLogs(logLimit);
  }, [logLimit]); // Se ejecuta cuando logLimit cambia

  const handleRefresh = () => {
    fetchLogs(logLimit); // Llama a fetchLogs con el límite actual
  };

  // Filtrar logs basado en los estados de filtro usando useMemo para optimización
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const roleMatch = filterRole ? log.role === filterRole : true;
      const sessionMatch = filterSessionId
        ? log.sessionId?.toLowerCase().includes(filterSessionId.toLowerCase()) // Búsqueda case-insensitive
        : true;
      return roleMatch && sessionMatch;
    });
  }, [logs, filterRole, filterSessionId]);

  // Función para formatear el timestamp a un string legible
  const formatTimestamp = (timestamp: Timestamp | number | undefined): string => {
    if (!timestamp) return "-";
    let date: Date;
    if (typeof timestamp === "object" && "toDate" in timestamp) { // Es un Timestamp de Firestore
      date = timestamp.toDate();
    } else if (typeof timestamp === "number") { // Es un número (ej. de Date.now())
      date = new Date(timestamp);
    } else {
      return "Fecha inválida";
    }
    return date.toLocaleString("es-CL", { // Formato chileno
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    });
  };

  // Función para convertir los datos de logs a formato CSV
  const convertToCSV = (data: LogEntry[]) => {
    if (!data || data.length === 0) return "";
    // Definir las cabeceras del CSV
    const headers = ["ID Documento", "Rol", "Contenido", "Session ID", "IP", "Timestamp (es-CL)"];
    const csvRows = [
      headers.join(","), // Fila de cabeceras
    ];

    // Mapear cada log a una fila del CSV
    data.forEach((log) => {
      const row = [
        `"${log.id || ""}"`, // ID del documento de Firestore
        `"${log.role || ""}"`,
        `"${(log.content || "").replace(/"/g, '""').replace(/\n/g, '\\n')}"`, // Escapar comillas dobles y saltos de línea
        `"${log.sessionId || ""}"`,
        `"${log.ip || ""}"`,
        `"${formatTimestamp(log.timestamp) || ""}"`,
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n"); // Unir todas las filas con saltos de línea
  };

  // Manejador para la exportación a CSV
  const handleExportCSV = () => {
    const csvData = convertToCSV(filteredLogs);
    if (csvData) {
      const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" }); // Añadir BOM para UTF-8 en Excel
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute(
          "download",
          `rigbot_logs_${dateStr}.csv` // Nombre del archivo CSV
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click(); // Simular click para descargar
        document.body.removeChild(link); // Limpiar
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
                >
                    <option value="">Todos</option>
                    <option value="user">Usuario (user)</option>
                    <option value="assistant">Asistente (assistant)</option>
                    {/* Puedes añadir más roles si los llegas a usar */}
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
                />
            </div>
             <div>
                <label htmlFor="logLimit" className="block text-sm font-medium text-slate-700 mb-1">Mostrar Logs:</label>
                <select
                    id="logLimit"
                    value={logLimit}
                    onChange={(e) => setLogLimit(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-150"
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
                    disabled={loading}
                    title="Actualizar lista de logs"
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 transition-opacity duration-150"
                >
                    <RefreshIcon />
                    {loading ? "Cargando..." : "Actualizar"}
                </button>
                <button
                    onClick={handleExportCSV}
                    disabled={loading || filteredLogs.length === 0}
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
      {loading ? (
        <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-5 text-lg">Cargando logs, un momento por favor...</p>
        </div>
      ) : filteredLogs.length === 0 && !error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md p-6">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-20 h-20 text-slate-400 mx-auto mb-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-slate-500 text-xl">No se encontraron logs.</p>
            {logs.length > 0 && ( // Mostrar este mensaje solo si hay logs pero no coinciden con el filtro
                 <p className="text-sm text-slate-400 mt-2">Intenta ajustar los filtros o presiona "Actualizar".</p>
            )}
             {logs.length === 0 && ( // Mostrar este mensaje si no hay logs en la base de datos en absoluto
                 <p className="text-sm text-slate-400 mt-2">Parece que aún no hay logs registrados en la base de datos.</p>
            )}
        </div>
      ) : !error && ( // Solo mostrar la tabla si no hay error y hay logs filtrados
        <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
          <table className="min-w-full text-sm divide-y divide-slate-200">
            <thead className="bg-slate-200 sticky top-0 z-10"> {/* Cabecera pegajosa */}
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
        <p>Inspirado por el gran Rigo y el "codificador estrella" Gemini. ✨</p>
      </footer>
    </div>
  );
}
