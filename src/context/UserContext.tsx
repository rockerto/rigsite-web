// rigsite-fixed/src/context/UserContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "@/lib/firebase"; 
import { onAuthStateChanged, User } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  Firestore, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore"; 
import { DEFAULT_SYSTEM_PROMPT_TEMPLATE } from '@/lib/defaultSystemPromptTemplate';

// Interfaz para los datos del cliente que esperamos de Firestore
interface ClientData {
  clientId: string;
  name: string;
  email: string;
  plan: "free" | "premium"; // Puedes añadir más planes aquí si es necesario
  basePrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  telefono?: string;
  direccion?: string;
  horario?: string;
  whatsappNumber?: string;
  calendarQueryDays?: number;
  calendarMaxUserRequestDays?: number;
  pricingInfo?: string;
  chiropracticVideoUrl?: string;
  createdAt?: string; // Guardaremos la fecha como string ISO en el estado local

  // --- Propiedades para Google Calendar ---
  googleCalendarConnected?: boolean; // Indica si el usuario ha conectado su calendario
  googleCalendarEmail?: string;    // Opcional: para mostrar qué cuenta de Google Calendar está conectada
  // Más adelante, podrías necesitar aquí los tokens o una referencia a ellos,
  // pero por ahora, estos dos campos son un buen comienzo para la UI.
  // googleCalendarRefreshToken?: string; // Ejemplo: se guardaría encriptado o con acceso muy restringido
  // googleCalendarAccessToken?: string;  // Ejemplo: de corta duración
  // googleCalendarTokenExpiry?: number;  // Ejemplo
}

// Tipo para el contexto del usuario
type UserContextType = {
  user: User | null;
  firebaseAuthLoading: boolean;
  clientId: string | null;
  clientData: ClientData | null;
  clientDataLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Tipo para los valores por defecto de un nuevo cliente
// Actualizado para incluir las nuevas propiedades de Google Calendar
type DefaultClientValues = Omit<ClientData, 'clientId' | 'email' | 'createdAt'> & { email?: string };

const defaultNewClientValues: DefaultClientValues = {
  name: "Nuevo Usuario Rigbot",
  plan: "free",
  basePrompt: DEFAULT_SYSTEM_PROMPT_TEMPLATE, 
  welcomeMessage: "¡Bienvenido a tu Rigbot! Personaliza mis respuestas desde el panel de configuración.",
  fallbackMessage: "Lo siento, no te he entendido. ¿Podrías intentarlo de nuevo?",
  telefono: "",
  direccion: "Dirección no configurada",
  horario: "Horario no configurado",
  whatsappNumber: "", 
  calendarQueryDays: 7,
  calendarMaxUserRequestDays: 21,
  pricingInfo: "Información de precios no configurada.",
  chiropracticVideoUrl: "",
  // Valores por defecto para Google Calendar
  googleCalendarConnected: false,
  googleCalendarEmail: "",
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseAuthLoading, setFirebaseAuthLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null); 
  const [clientDataLoading, setClientDataLoading] = useState(true);

  useEffect(() => {
    console.log("UserProvider: Montado. Suscribiéndose a onAuthStateChanged.");
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("UserProvider: onAuthStateChanged disparado. Usuario actual:", currentUser?.uid || "ninguno");
      setUser(currentUser);
      setFirebaseAuthLoading(false);

      if (currentUser) {
        setClientDataLoading(true);
        console.log("UserProvider: Usuario autenticado, intentando obtener datos del cliente para UID:", currentUser.uid);
        try {
          const dbFs: Firestore = getFirestore(auth.app); // Asegúrate que auth.app esté disponible
          const clientDocRef = doc(dbFs, "clients", currentUser.uid);
          const clientDocSnap = await getDoc(clientDocRef);

          if (clientDocSnap.exists()) {
            const rawData = clientDocSnap.data();
            // Asegurarse de que los campos opcionales tengan un fallback si no existen en Firestore
            const processedData: ClientData = {
              clientId: rawData.clientId || currentUser.uid,
              name: rawData.name || currentUser.displayName || "Usuario Rigbot",
              email: rawData.email || currentUser.email || "",
              plan: rawData.plan || "free",
              basePrompt: rawData.basePrompt || DEFAULT_SYSTEM_PROMPT_TEMPLATE,
              welcomeMessage: rawData.welcomeMessage || defaultNewClientValues.welcomeMessage,
              fallbackMessage: rawData.fallbackMessage || defaultNewClientValues.fallbackMessage,
              telefono: rawData.telefono || "",
              direccion: rawData.direccion || "",
              horario: rawData.horario || "",
              whatsappNumber: rawData.whatsappNumber || "",
              calendarQueryDays: rawData.calendarQueryDays || defaultNewClientValues.calendarQueryDays,
              calendarMaxUserRequestDays: rawData.calendarMaxUserRequestDays || defaultNewClientValues.calendarMaxUserRequestDays,
              pricingInfo: rawData.pricingInfo || "",
              chiropracticVideoUrl: rawData.chiropracticVideoUrl || "",
              createdAt: rawData.createdAt ? (rawData.createdAt instanceof Timestamp ? rawData.createdAt.toDate().toISOString() : String(rawData.createdAt)) : new Date().toISOString(),
              googleCalendarConnected: rawData.googleCalendarConnected || false,
              googleCalendarEmail: rawData.googleCalendarEmail || "",
            };
            
            console.log("UserProvider: Documento de cliente encontrado y procesado desde Firestore:", processedData);
            setClientData(processedData);
            setClientId(processedData.clientId); 
            console.log("UserProvider: ClientId establecido a:", processedData.clientId);

          } else {
            console.warn("UserProvider: No se encontró documento en Firestore para UID:", currentUser.uid, "en 'clients'. Creando uno nuevo.");
            const newClientId = currentUser.uid; 
            
            const newClientDataForFirestore = {
              ...defaultNewClientValues, // Incluye googleCalendarConnected: false y googleCalendarEmail: ""
              name: currentUser.displayName || defaultNewClientValues.name,
              email: currentUser.email || "", // Asegurar que email no sea undefined
              clientId: newClientId, 
              createdAt: serverTimestamp(), 
            };
            // Para el estado local, usar una fecha ISO para createdAt y los defaults.
            const newClientDataForState: ClientData = {
              ...defaultNewClientValues,
              name: currentUser.displayName || defaultNewClientValues.name,
              email: currentUser.email || "",
              clientId: newClientId, 
              createdAt: new Date().toISOString(),
              // googleCalendarConnected y googleCalendarEmail ya están en defaultNewClientValues
            };

            try {
              await setDoc(clientDocRef, newClientDataForFirestore); 
              setClientData(newClientDataForState);
              setClientId(newClientId);
              console.log("UserProvider: Nuevo documento de cliente creado en Firestore con clientId (UID):", newClientId);
            } catch (creationError) {
              console.error("UserProvider: Error creando nuevo documento de cliente en Firestore:", creationError);
              setClientData(null);
              setClientId(null);
            }
          }
        } catch (error) {
          console.error("UserProvider: Error obteniendo/creando datos del cliente de Firestore:", error);
          setClientData(null);
          setClientId(null);
        } finally {
          setClientDataLoading(false);
        }
      } else { 
        setClientData(null);
        setClientId(null);
        setClientDataLoading(false); // Importante para detener la carga si no hay usuario
      }
    });

    return () => {
      console.log("UserProvider: Desmontado. Desuscribiéndose de onAuthStateChanged.");
      unsubscribe();
    };
  }, []); // El array de dependencias vacío asegura que esto se ejecute solo una vez (al montar/desmontar)

  return (
    <UserContext.Provider value={{ user, firebaseAuthLoading, clientId, clientData, clientDataLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser debe ser usado dentro de un UserProvider");
  }
  return context;
}