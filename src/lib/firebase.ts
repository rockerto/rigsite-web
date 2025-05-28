// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, // O browserSessionPersistence si lo prefieres
  type Auth 
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore"; // Para Firestore del lado del cliente

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // Declara db aquí

// Comprobamos si estamos en el navegador y si Firebase no ha sido inicializado
if (typeof window !== "undefined" && !getApps().length) {
  try {
    console.log("Firebase.ts: Inicializando Firebase App en el cliente...");
    app = initializeApp(firebaseConfig);
    // Usamos initializeAuth para mejor manejo de la persistencia en Next.js
    auth = initializeAuth(app, {
      persistence: browserLocalPersistence,
      // No es necesario popupRedirectResolver si no usas operaciones de redirección de OAuth directamente con el SDK de cliente aquí
    });
    db = getFirestore(app); // Inicializar Firestore para el cliente
    console.log("Firebase.ts: Firebase App, Auth y Firestore inicializados para el cliente.");
  } catch (error) {
    console.error("Firebase.ts: Error inicializando Firebase en el cliente:", error);
    // En caso de error, app, auth y db podrían no estar definidas.
    // Los componentes que las usen deberían manejar esto o depender de un estado de carga.
  }
} else if (getApps().length > 0) {
  // Si ya está inicializado, obtenemos las instancias
  // console.log("Firebase.ts: Firebase App ya estaba inicializada.");
  app = getApp();
  auth = getAuth(app); // getAuth es seguro para obtener la instancia si ya está inicializada
  db = getFirestore(app);
} else {
  // Esto se ejecutaría en el servidor durante el build si no está la condición typeof window
  console.warn("Firebase.ts: SDK de Firebase (cliente) NO inicializado (probablemente en build de servidor o `window` no está definido).");
  // Las variables app, auth, db permanecerán sin definir aquí, lo cual es correcto para el build del servidor
  // si este archivo es solo para la inicialización del SDK del cliente.
}

// Exportar las instancias que necesites.
// Es importante que las exportaciones puedan ser undefined si la inicialización falla o es diferida.
export { app, auth, db };