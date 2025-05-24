(() => {
  // URL del backend del PRODUCTO (donde vive chat.js)
  const PRODUCTION_BACKEND_URL = 'https://rigbot-product.vercel.app/api/chat'; 
  
  // URL del backend local. Si corres rigbot-product localmente, usa su puerto.
  // Si tu API de chat.js (de rigbot-product) también corre en el puerto 3000 cuando desarrollas rigsite-fixed, está bien.
  // Si rigbot-product corre en otro puerto local (ej. 3001), cámbialo aquí.
  const LOCAL_BACKEND_URL = 'http://localhost:3000/api/chat'; // Ajusta este puerto si es necesario

  const IS_PAGE_SERVED_LOCALLY = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Determinar la URL del backend:
  // 1. Si window.NEXT_PUBLIC_RIGBOT_BACKEND_URL está definida, se usa esa (para overrides).
  // 2. Si la página (rigsite-web) se sirve localmente, usa LOCAL_BACKEND_URL.
  // 3. Si no, usa PRODUCTION_BACKEND_URL.
  let backendUrl = window.NEXT_PUBLIC_RIGBOT_BACKEND_URL; 
  if (!backendUrl) { 
    if (IS_PAGE_SERVED_LOCALLY) {
      // Cuando rigsite-web (donde está este widget) corre en localhost,
      // asumimos que el backend (rigbot-product/api/chat) también está accesible localmente
      // en LOCAL_BACKEND_URL.
      // ¡ASEGÚRATE DE QUE TU API DE RIGBOT-PRODUCT ESTÉ CORRIENDO LOCALMENTE EN ESA URL Y PUERTO!
      backendUrl = LOCAL_BACKEND_URL;
      console.log("--- Rigbot Widget Info (vLocalDev) --- Widget en localhost, apuntando API a:", backendUrl);
    } else {
      backendUrl = PRODUCTION_BACKEND_URL;
      console.log("--- Rigbot Widget Info (vProdFallback) --- Widget en producción, apuntando API a:", backendUrl);
    }
  } else {
    console.log("--- Rigbot Widget Info (vEnvOverride) --- Usando NEXT_PUBLIC_RIGBOT_BACKEND_URL:", backendUrl);
  }

  const rigbotClientId = window.RIGBOT_CLIENT_ID || 'demo-client';
  
  console.log("--- Rigbot Widget Final Config --- URL API:", backendUrl, "para ClientID:", rigbotClientId);

  // ... (el resto de tu rigbot-widget.js se mantiene igual que en la versión anterior que te di)
  // ... (createBubbles, toggleChatWindow, openChatWindow, closeChatWindow, addMessageToChat, sendMessage, event listener de carga) ...
  // La función sendMessage usará esta 'backendUrl' que acabamos de definir.

  // Aquí copio solo la función sendMessage para mostrar dónde se usa backendUrl,
  // el resto del código del widget (burbujas, UI, etc.) es el mismo que te pasé antes.

  const sendMessage = async () => {
    const inputElement = document.getElementById('rigbot-input-custom');
    if (!inputElement) return;

    const text = inputElement.value.trim();
    if (!text) return;

    addMessageToChat(text, 'user');
    inputElement.value = ''; 
    inputElement.focus();   

    addMessageToChat('', 'bot', true); 

    console.log("📦 Enviando a API con clientId:", rigbotClientId, "a URL:", backendUrl); 

    try {
      const response = await fetch(backendUrl, { // <--- Se usa la backendUrl definida arriba
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          clientId: rigbotClientId
        })
      });
      
      // ... resto de la lógica de sendMessage ...
      const existingTypingIndicator = document.getElementById('rigbot-typing-indicator');
      if (existingTypingIndicator) {
        existingTypingIndicator.remove();
      }

      if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) { /* No es JSON o está vacío */ }
        console.error('Error en la respuesta del servidor:', response.status, errorData);
        addMessageToChat(errorData?.error || 'Hubo un problema con la respuesta del servidor.', 'bot');
        return;
      }

      const data = await response.json();
      addMessageToChat(data.response || 'Lo siento, no he podido procesar eso en este momento.', 'bot');

    } catch (err) {
      console.error('❌ Error en fetch Rigbot:', err);
      const existingTypingIndicator = document.getElementById('rigbot-typing-indicator');
      if (existingTypingIndicator) {
        existingTypingIndicator.remove();
      }
      addMessageToChat('❌ Ups, parece que hay un problema de conexión. Intenta de nuevo.', 'bot');
    }
  };

  // Asegúrate de que el resto de las funciones (createBubbles, openChatWindow, etc.)
  // estén aquí, tal como te las pasé en la respuesta anterior donde te di el widget completo.
  // Por brevedad, no las repito todas aquí.
  
  // Ejemplo de cómo debería seguir:
  let chatWindowInstance = null; 
  let chatBubbleInstance = null; 
  let whatsappBubbleInstance = null; 

  const createBubbles = () => { /* ... tu código ... */ };
  const toggleChatWindow = () => { /* ... tu código ... */ };
  const openChatWindow = () => { /* ... tu código ... */ };
  const closeChatWindow = () => { /* ... tu código ... */ };
  const addMessageToChat = (text, sender = 'bot', isLoading = false) => { /* ... tu código ... */ };
  // sendMessage ya está arriba
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createBubbles();
  } else {
    window.addEventListener('load', createBubbles);
  }

})();