// src/global.d.ts
declare global {
  interface Window {
    RIGBOT_CLIENT_ID?: string | null; // Puede ser string, null, o no existir (undefined)
    RIGBOT_CLAVE?: string | null;    // Puede ser string, null, o no existir (undefined)
    rigbotConversationHistory?: Array<{ role: string; content: string }>; // Para el historial de chat si se maneja globalmente
  }
}

// Es importante exportar algo (aunque sea vacío) para que TypeScript lo trate como un módulo
// y aplique las declaraciones globales.
export {};