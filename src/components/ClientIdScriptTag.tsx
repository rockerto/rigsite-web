// rigsite-fixed/src/components/ClientIdScriptTag.tsx
"use client"; 

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

export default function ClientIdScriptTag() {
  const { clientId, clientDataLoading, firebaseAuthLoading, user } = useUser(); 

  useEffect(() => {
    let finalClientId = "demo-client"; // Fallback por defecto

    // Solo definir el clientId si la carga de auth y datos del cliente ha terminado
    if (!firebaseAuthLoading && !clientDataLoading) {
      if (user && clientId) { 
        finalClientId = clientId;
      } else if (user && !clientId) { 
        console.warn(`ClientIdScriptTag (useEffect): Usuario ${user.uid} autenticado pero SIN clientId del contexto aún. Usando fallback '${finalClientId}'.`);
      } else { 
        console.log(`ClientIdScriptTag (useEffect): No hay usuario autenticado. Usando fallback '${finalClientId}'.`);
      }
    } else {
      console.log("ClientIdScriptTag (useEffect): Auth/ClientData aún cargando, usando fallback temporal '${finalClientId}' para el script.");
    }
    
    // Intentar remover script antiguo si existe, para asegurar que siempre tengamos el último valor
    const oldScript = document.getElementById("rigbot-client-id-dynamic-script");
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement("script");
    script.id = "rigbot-client-id-dynamic-script"; // ID único
    const escapedClientId = finalClientId.replace(/"/g, '\\"').replace(/'/g, "\\'");
    script.innerHTML = `
      window.RIGBOT_CLIENT_ID = "${escapedClientId}";
      console.log("RIGBOT_CLIENT_ID inyectado (desde ClientIdScriptTag vManual):", window.RIGBOT_CLIENT_ID);
    `;
    // Añadir al head para que esté disponible lo antes posible
    document.head.appendChild(script); 

    // No es estrictamente necesario removerlo al desmontar si la lógica de arriba ya lo reemplaza,
    // pero es buena práctica si el clientId pudiera cambiar y requerir una re-inyección limpia.
    return () => {
      const scriptToRemove = document.getElementById("rigbot-client-id-dynamic-script");
      if (scriptToRemove) {
        scriptToRemove.remove();
        console.log("ClientIdScriptTag (useEffect cleanup): Script de clientId removido.");
      }
    };
  }, [clientId, clientDataLoading, firebaseAuthLoading, user]);

  return null; 
}