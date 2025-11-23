// /lib/websocketClient.ts
interface Notificacion {
    id: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    fecha: string;
    leida: boolean;
    datos_adicionales?: {
      criptomoneda: string;
      precio_objetivo: number;
      precio_actual: number;
      condicion: string;
    };
  }
  
  interface WSMessage {
    tipo:
      | "nueva_notificacion"
      | "notificaciones_actualizadas"
      | "ping"
      | "error_autenticacion";
    datos:
      | {
          id: number;
          criptomoneda: string;
          precio_objetivo: number;
          precio_actual: number;
          condicion: string;
        } // para "nueva_notificacion"
      | Notificacion[] // para "notificaciones_actualizadas"
      | undefined
      | string; // para "ping" o "error_autenticacion"
  }
  
  let ws: WebSocket | null = null;
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  let messageHandlers: ((data: WSMessage) => void)[] = [];
  let connectionHandlers: ((connected: boolean) => void)[] = [];
  
  const WS_URL = "wss://dportfolio-backend-production.up.railway.app/api/ws";
  
  export function connectWebSocket(token: string, usuarioId: string) {
    if (
      ws &&
      (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket ya está conectado o conectándose");
      return ws;
    }
  
    // Limpiar conexión anterior si existe
    if (ws) {
      ws.close();
      ws = null;
    }
  
    console.log("Conectando WebSocket:", WS_URL);
    ws = new WebSocket(WS_URL);
  
    ws.onopen = () => {
      console.log("🟢 WS conectado! Enviando autenticación...");
      connectionHandlers.forEach((handler) => handler(true));
      ws?.send(
        JSON.stringify({
          tipo: "autenticar",
          token,
          usuarioId,
        })
      );
    };
  
    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data: WSMessage = JSON.parse(event.data);
        console.log("📨 Mensaje WS recibido:", data.tipo);
        messageHandlers.forEach((handler) => handler(data));
      } catch (err) {
        console.error("Error parsing WS message:", err, event.data);
      }
    };
  
    ws.onclose = (event: CloseEvent) => {
      console.log(`🔴 WS cerrado (code=${event.code}, reason=${event.reason})`);
      connectionHandlers.forEach((handler) => handler(false));
      ws = null;
  
      // Reconectar solo si no fue un cierre intencional
      if (event.code !== 1000 && !reconnectTimeout) {
        console.log("🔄 Intentando reconexión en 3 segundos...");
        reconnectTimeout = setTimeout(() => {
          reconnectTimeout = null;
          connectWebSocket(token, usuarioId);
        }, 3000);
      }
    };
  
    ws.onerror = (err: Event) => {
      console.error("❌ WS Error:", err);
      connectionHandlers.forEach((handler) => handler(false));
    };
  
    return ws;
  }
  
  // Permite que los componentes se suscriban a mensajes sin abrir sockets repetidos
  export function addWebSocketMessageListener(
    handler: (data: WSMessage) => void
  ) {
    messageHandlers.push(handler);
  
    return () => {
      messageHandlers = messageHandlers.filter((h) => h !== handler);
    };
  }
  
  export function addConnectionListener(handler: (connected: boolean) => void) {
    connectionHandlers.push(handler);
    return () => {
      connectionHandlers = connectionHandlers.filter((h) => h !== handler);
    };
  }
  
  export function disconnectWebSocket() {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    
    if (ws) {
      ws.close(1000, "Cierre intencional");
      ws = null;
    }
  }
  
  export function getWebSocketState(): number {
    return ws ? ws.readyState : WebSocket.CLOSED;
  }
  
  // NUEVA FUNCIÓN: Verificar si el WebSocket está realmente conectado
  export function isWebSocketConnected(): boolean {
    return ws !== null && ws.readyState === WebSocket.OPEN;
  }
