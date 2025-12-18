// Em seu arquivo useHostResolver.ts

function webSocketHostResolver(): string {
  // 1. Pega o host exato que você está usando no navegador
  // (ex: "localhost" ou "26.234.128.245" ou "meusite.ngrok-free.app")
  let currentHost = window.location.hostname;

  // Se estiver rodando em Electron (protocolo 'file:'), use 'localhost'
  if (window.location.protocol === 'file:') {
    currentHost = 'localhost';
  }

  // 2. Detecta se a página atual (Vite) está em HTTPS
  const isSecure = window.location.protocol === 'https:';

  // 3. Define o protocolo do WebSocket (WSS para HTTPS, WS para HTTP)
  const protocol = isSecure ? 'wss' : 'ws';

  // 4. Define a porta do seu backend Node.js (que está rodando localmente)
  const backendPort = 3001; 

  // 5. Monta a URL completa e dinâmica do backend
  // Ex: "ws://26.234.128.245:3001"
  // Ex: "http://localhost:3001"
  // Ex: "wss://meusite.ngrok-free.app:3001" (se o ngrok estiver configurado)
  const resolvedHost = `${protocol}://${currentHost}:${backendPort}`;

  return resolvedHost;
}

function setWebSocketEventName(entityName: string, eventName: string) {
  return `${entityName}:${eventName}`;
}

export {
  webSocketHostResolver,
  setWebSocketEventName
};