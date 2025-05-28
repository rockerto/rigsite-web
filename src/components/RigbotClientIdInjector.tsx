"use client";

import { useUser } from "@/context/UserContext";
import { useEffect } from "react";

export default function RigbotClientIdInjector() {
  const { clientId: authenticatedClientId, firebaseAuthLoading, clientDataLoading, user, clientData } = useUser(); 

  useEffect(() => {
    if (firebaseAuthLoading || clientDataLoading) {
      console.log("RigbotClientIdInjector: Esperando carga de auth o clientData...");
      return;
    }

    const clientIdToUse = authenticatedClientId || 'demo-client';
    
    const rigbotProductBaseUrl = process.env.NEXT_PUBLIC_RIGBOT_PRODUCT_URL;

    if (!rigbotProductBaseUrl) {
      console.error("RigbotClientIdInjector: La variable de entorno NEXT_PUBLIC_RIGBOT_PRODUCT_URL no está configurada.");
      delete window.RIGBOT_CLIENT_ID; // Asegurar limpieza si no se puede proceder
      delete window.RIGBOT_CLAVE;
      return;
    }

    // ----- INICIO DE LA CORRECCIÓN -----
    // Cambiado de 'let' a 'const' ya que no se reasigna después.
    // Si en el futuro decides añadir la clave aquí, podrías volver a necesitar 'let'.
    const widgetSrcUrl = `${rigbotProductBaseUrl}/api/widget?clientId=${encodeURIComponent(clientIdToUse)}`;
    // ----- FIN DE LA CORRECCIÓN -----
    
    // Ejemplo si quisieras pasar la clave desde clientData como query param (necesitaría 'let' arriba):
    // let widgetSrcUrl = `${rigbotProductBaseUrl}/api/widget?clientId=${encodeURIComponent(clientIdToUse)}`;
    // const claveDelCliente = clientData?.clave; 
    // if (claveDelCliente && claveDelCliente.trim() !== "") {
    //   widgetSrcUrl += `&clave=${encodeURIComponent(claveDelCliente)}`;
    // }

    console.log(`RigbotClientIdInjector: Preparando para cargar widget desde: ${widgetSrcUrl}`);

    const oldScript = document.getElementById('rigbot-backend-loader-script');
    if (oldScript) {
      oldScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'rigbot-backend-loader-script';
    script.src = widgetSrcUrl;
    script.defer = true;
    script.onload = () => {
      console.log(`RigbotClientIdInjector: Script cargador del widget (${widgetSrcUrl}) cargado exitosamente.`);
    };
    script.onerror = () => {
      console.error(`RigbotClientIdInjector: ERROR al cargar el script cargador del widget desde ${widgetSrcUrl}`);
    };
    document.head.appendChild(script);

    return () => {
      const scriptTag = document.getElementById('rigbot-backend-loader-script');
      if (scriptTag) {
        // Considera si quieres removerlo al desmontar para evitar efectos en navegación SPA
        // scriptTag.remove(); 
      }
    };
  }, [authenticatedClientId, firebaseAuthLoading, clientDataLoading, user, clientData]); 

  return null;
}