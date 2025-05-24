(() => {
  // URL del backend del PRODUCTO (donde vive chat.js)
  const PRODUCTION_BACKEND_URL = 'https://rigbot-product.vercel.app/api/chat'; 
  
  // URL del backend local de rigbot-product. 
  // ¡DEBES ASEGURARTE DE QUE TU PROYECTO rigbot-product ESTÉ CORRIENDO LOCALMENTE EN ESTA URL Y PUERTO CUANDO PRUEBES!
  // Si rigbot-product corre en el puerto 3001 localmente (diferente al 3000 de rigsite-fixed):
  const LOCAL_RIGBOT_PRODUCT_API_URL = 'http://localhost:3001/api/chat'; 
  // Si por alguna razón tu rigbot-product/api/chat también corre en el 3000 (menos común si son proyectos separados):
  // const LOCAL_RIGBOT_PRODUCT_API_URL = 'http://localhost:3000/api/chat';


  // Verifica si la PÁGINA ACTUAL (rigsite-web) se sirve desde localhost
  const IS_RIGSITE_WEB_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  let backendUrl;
  
  // Prioridad:
  // 1. Si window.NEXT_PUBLIC_RIGBOT_BACKEND_URL está definida explícitamente, usar esa.
  // 2. Si la página rigsite-web está en localhost, usar la URL local del API de rigbot-product.
  // 3. Si no, usar la URL de producción del API de rigbot-product.
  if (window.NEXT_PUBLIC_RIGBOT_BACKEND_URL) {
    backendUrl = window.NEXT_PUBLIC_RIGBOT_BACKEND_URL;
    console.log("--- Rigbot Widget (desde rigsite-fixed/public) --- Usando NEXT_PUBLIC_RIGBOT_BACKEND_URL:", backendUrl);
  } else if (IS_RIGSITE_WEB_LOCAL) {
    backendUrl = LOCAL_RIGBOT_PRODUCT_API_URL;
    console.log("--- Rigbot Widget (desde rigsite-fixed/public) --- rigsite-web en localhost, API objetivo (local de rigbot-product):", backendUrl);
  } else {
    backendUrl = PRODUCTION_BACKEND_URL;
    console.log("--- Rigbot Widget (desde rigsite-fixed/public) --- rigsite-web en producción, API objetivo (prod de rigbot-product):", backendUrl);
  }

  const rigbotClientId = window.RIGBOT_CLIENT_ID || 'demo-client'; 
  
  console.log("--- Rigbot Widget Final Config --- URL API Real a Usar:", backendUrl, "para ClientID:", rigbotClientId);

  // AQUÍ VA TODO EL RESTO DEL CÓDIGO DE rigbot-widget.js QUE TE DI ANTES
  // (createBubbles, toggleChatWindow, openChatWindow, closeChatWindow, addMessageToChat, sendMessage, 
  // y el event listener de carga. La función sendMessage usará la 'backendUrl' definida arriba)
  // Lo omito por brevedad, pero asegúrate de tenerlo completo. Te pongo la estructura de sendMessage:

  let chatWindowInstance = null; 
  let chatBubbleInstance = null; 
  let whatsappBubbleInstance = null; 

  const createBubbles = () => { /* ... tu código completo de createBubbles ... */ };
  const toggleChatWindow = () => { /* ... tu código completo de toggleChatWindow ... */ };
  const openChatWindow = () => { /* ... tu código completo de openChatWindow ... */ };
  const closeChatWindow = () => { /* ... tu código completo de closeChatWindow ... */ };
  const addMessageToChat = (text, sender = 'bot', isLoading = false) => { /* ... tu código completo de addMessageToChat ... */ };

  const sendMessage = async () => {
    const inputElement = document.getElementById('rigbot-input-custom');
    if (!inputElement) {
        console.error("Error: No se encontró el input 'rigbot-input-custom'");
        return;
    }
    const text = inputElement.value.trim();
    if (!text) return;

    addMessageToChat(text, 'user');
    inputElement.value = ''; 
    inputElement.focus();   
    addMessageToChat('', 'bot', true); 

    console.log("📦 Enviando a API con clientId:", rigbotClientId, "a URL:", backendUrl); 

    try {
      const response = await fetch(backendUrl, { // <--- Se usa la backendUrl correcta
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, clientId: rigbotClientId })
      });
      
      const existingTypingIndicator = document.getElementById('rigbot-typing-indicator');
      if (existingTypingIndicator) { existingTypingIndicator.remove(); }

      if (!response.ok) {
        let errorData; try { errorData = await response.json(); } catch (e) { /* No JSON */ }
        console.error('Error en la respuesta del servidor:', response.status, errorData);
        addMessageToChat(errorData?.error || 'Hubo un problema con la respuesta del servidor.', 'bot');
        return;
      }
      const data = await response.json();
      addMessageToChat(data.response || 'Lo siento, no he podido procesar eso en este momento.', 'bot');
    } catch (err) {
      console.error('❌ Error en fetch Rigbot:', err);
      const existingTypingIndicator = document.getElementById('rigbot-typing-indicator');
      if (existingTypingIndicator) { existingTypingIndicator.remove(); }
      addMessageToChat('❌ Ups, parece que hay un problema de conexión. Intenta de nuevo.', 'bot');
    }
  };
  
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createBubbles();
  } else {
    window.addEventListener('load', createBubbles);
  }
})();