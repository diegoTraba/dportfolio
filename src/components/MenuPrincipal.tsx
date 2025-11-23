"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  connectWebSocket,
  addWebSocketMessageListener,
  addConnectionListener,
  isWebSocketConnected,
} from "../lib/webSockedClient";

// Tipos para las notificaciones
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

export default function MenuPrincipal() {
  const rutaActual = usePathname();
  const navegador = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(rutaActual);
  const [notificacionesAbierto, setNotificacionesAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  // ESTADO CORREGIDO: Verificar estado real del WebSocket al inicializar
  const [estaConectado, setEstaConectado] = useState(() => {
    if (typeof window !== "undefined") {
      return isWebSocketConnected();
    }
    return false;
  });

  const [reconectando, setReconectando] = useState(false);

  // useRef para mantener el estado entre re-renders
  const wsConnectedRef = useRef(false);

  const BACKEND_URL = "https://dportfolio-backend-production.up.railway.app";

  // Inicializar el nombre del usuario directamente en useState
  const [nombreUsuario, setNombreUsuario] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nombreUsuario") || "";
    }
    return "";
  });

  // ==========================================================================
  // FUNCIONES PRINCIPALES - Usando useCallback para memoización
  // ==========================================================================

  /**
   * Obtener token de autenticación
   */
  const obtenerToken = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken") || "";
    }
    return "";
  }, []);

  /**
   * Obtener ID de usuario
   */
  const obtenerUsuarioId = useCallback(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("idUsuario") || "";
    }
    return "";
  }, []);

  /**
   * Verificar si el usuario está autenticado
   */
  const estaAutenticado = useCallback(() => {
    const token = obtenerToken();
    const usuarioId = obtenerUsuarioId();
    return !!(token && usuarioId);
  }, [obtenerToken, obtenerUsuarioId]);

  /**
   * Headers para las peticiones autenticadas
   */
  const obtenerHeaders = useCallback(() => {
    const token = obtenerToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }, [obtenerToken]);

  /**
   * Manejar token inválido o expirado - DEFINIR PRIMERO
   */
  const manejarTokenInvalido = useCallback(() => {
    console.log("🔐 Token inválido, cerrando sesión...");
    // Limpiar localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("estaLogueado");
    localStorage.removeItem("correoUsuario");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("nombreUsuario");

    setNombreUsuario("");
    setEstaConectado(false);

    // Redirigir al login
    navegador.push("/");
  }, [navegador]);

  /**
   * Mostrar notificación del sistema nativa del navegador
   */
  const mostrarNotificacionSistema = useCallback(
    (notificacion: Notificacion) => {
      // Verificar si el navegador soporta notificaciones y tenemos permisos
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(notificacion.titulo, {
          body: notificacion.mensaje,
          icon: "/img/logo_DPortfolio.png",
          tag: notificacion.id.toString(),
        });
      }
    },
    []
  );

  /**
   * Solicitar permisos para notificaciones del sistema
   */
  const solicitarPermisosNotificaciones = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("✅ Permisos para notificaciones concedidos");
        } else if (permission === "denied") {
          console.log("❌ Permisos para notificaciones denegados");
        }
      } catch (error) {
        console.error("Error solicitando permisos:", error);
      }
    }
  }, []);

  /**
   * Cargar notificaciones desde la API REST
   */
  const cargarNotificaciones = useCallback(async () => {
    try {
      // Si no hay usuario autenticado, no cargar notificaciones
      if (!estaAutenticado()) {
        console.log(
          "⚠️ Usuario no autenticado, omitiendo carga de notificaciones"
        );
        return;
      }

      // const token = obtenerToken();
      const usuarioId = obtenerUsuarioId();
      const response = await fetch(`${BACKEND_URL}/api/notificaciones`, {
        method: "GET",
        headers: obtenerHeaders(),
      });

      if (response.ok) {
        const data: Notificacion[] = await response.json();
        setNotificaciones(data);
        console.log(`✅ ${data.length} notificaciones cargadas`);
      } else if (response.status === 401) {
        console.error("❌ No autorizado - token inválido o expirado");
        manejarTokenInvalido();
      } else {
        console.error("❌ Error cargando notificaciones:", response.status);
      }
    } catch (error) {
      console.error("💥 Error cargando notificaciones:", error);
    }
  }, [
    BACKEND_URL,
    obtenerHeaders,
    estaAutenticado,
    manejarTokenInvalido,
    obtenerUsuarioId,
  ]);

  /**
   * Marcar una notificación como leída
   */
  const marcarComoLeida = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/notificaciones/${id}/leida`,
          {
            method: "PATCH",
            headers: obtenerHeaders(),
          }
        );

        if (response.ok) {
          setNotificaciones((prev) =>
            prev.map((notif) =>
              notif.id === id ? { ...notif, leida: true } : notif
            )
          );
        } else if (response.status === 401) {
          manejarTokenInvalido();
        } else {
          console.error("❌ Error marcando notificación como leída");
        }
      } catch (error) {
        console.error("💥 Error marcando notificación como leída:", error);
      }
    },
    [BACKEND_URL, obtenerHeaders, manejarTokenInvalido]
  );

  /**
   * Marcar TODAS las notificaciones como leídas
   */
  const marcarTodasComoLeidas = useCallback(async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/notificaciones/leer-todas`,
        {
          method: "PATCH",
          headers: obtenerHeaders(),
        }
      );

      if (response.ok) {
        setNotificaciones((prev) =>
          prev.map((notif) => ({ ...notif, leida: true }))
        );
      } else if (response.status === 401) {
        manejarTokenInvalido();
      } else {
        console.error("❌ Error marcando todas las notificaciones como leídas");
      }
    } catch (error) {
      console.error(
        "💥 Error marcando todas las notificaciones como leídas:",
        error
      );
    }
  }, [BACKEND_URL, obtenerHeaders, manejarTokenInvalido]);

  /**
   * Obtener ícono según el tipo de notificación
   */
  const obtenerIcono = useCallback((tipo: string) => {
    switch (tipo) {
      case "alerta":
        return (
          <svg
            className="w-4 h-4 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        );
      case "sistema":
        return (
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  }, []);

  /**
   * Verificar si una ruta está activa
   */
  const estaActiva = useCallback(
    (ruta: string) => {
      return rutaActual === ruta;
    },
    [rutaActual]
  );

  /**
   * Manejar cierre de sesión
   */
  const manejarCerrarSesion = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("estaLogueado");
    localStorage.removeItem("correoUsuario");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("nombreUsuario");
    setNombreUsuario("");

    navegador.push("/");
  }, [navegador]);

  // ==========================================================================
  // EFECTOS (useEffect) CORREGIDOS
  // ==========================================================================

  // NUEVO EFECTO: Sincronizar estado al montar el componente
  useEffect(() => {
    const syncConnectionState = () => {
      const realmenteConectado = isWebSocketConnected();
      console.log(
        `🔍 Sincronizando estado: ${realmenteConectado ? "CONECTADO" : "DESCONECTADO"}`
      );
      if (realmenteConectado !== estaConectado) {
        setEstaConectado(realmenteConectado);
        wsConnectedRef.current = realmenteConectado;
      }
    };

    // Sincronizar inmediatamente al montar
    syncConnectionState();

    // Y también después de un pequeño delay por si acaso
    const timer = setTimeout(syncConnectionState, 500);

    return () => clearTimeout(timer);
  }, []); // Solo se ejecuta al montar

  // EFECTO PRINCIPAL DEL WEBSOCKET (corregido)
  useEffect(() => {
    if (!estaAutenticado()) {
      console.log("🔐 Usuario no autenticado, omitiendo conexión WebSocket");
      return;
    }

    const token = obtenerToken();
    const usuarioId = obtenerUsuarioId();

    console.log("🔄 Iniciando conexión WebSocket...");

    // Conectar WebSocket
    const ws = connectWebSocket(token, usuarioId);

    // Agregar listener para cambios de conexión
    const removeConnectionListener = addConnectionListener(
      (conectado: boolean) => {
        console.log(
          `📡 Estado conexión: ${conectado ? "CONECTADO" : "DESCONECTADO"}`
        );
        setEstaConectado(conectado);
        wsConnectedRef.current = conectado;
        setReconectando(false);
      }
    );

    // Agregar listener para mensajes
    const removeMessageListener = addWebSocketMessageListener(
      (msg: WSMessage) => {
        console.log("📨 Procesando mensaje:", msg.tipo);

        switch (msg.tipo) {
          case "nueva_notificacion": {
            const datos = msg.datos as {
              id: number;
              criptomoneda: string;
              precio_objetivo: number;
              precio_actual: number;
              condicion: string;
            };

            const nueva: Notificacion = {
              id: datos.id,
              tipo: "alerta",
              titulo: `Alerta de ${datos.criptomoneda}`,
              mensaje: `${datos.criptomoneda} ha ${datos.condicion} $${datos.precio_objetivo}. Precio actual: $${datos.precio_actual}`,
              fecha: new Date().toISOString(),
              leida: false,
              datos_adicionales: datos,
            };

            setNotificaciones((prev) => [nueva, ...prev]);
            if (!notificacionesAbierto) {
              mostrarNotificacionSistema(nueva);
            }
            break;
          }

          case "notificaciones_actualizadas":
            setNotificaciones(msg.datos as Notificacion[]);
            break;

          case "ping":
            console.log("🏓 Recibido PING, enviando PONG");
            ws?.send(JSON.stringify({ tipo: "pong" }));
            break;

          case "error_autenticacion":
            console.error("❌ Error de autenticación en WebSocket");
            manejarTokenInvalido();
            break;

          default:
            console.warn("⚠️ Mensaje WS no manejado:", msg.tipo);
            break;
        }
      }
    );

    // Cleanup function - solo limpia listeners, NO la conexión WebSocket
    return () => {
      console.log(
        "🧹 Limpiando WebSocket listeners (manteniendo conexión global)"
      );
      removeConnectionListener();
      removeMessageListener();
    };
  }, [
    estaAutenticado,
    obtenerToken,
    obtenerUsuarioId,
    manejarTokenInvalido,
    notificacionesAbierto,
    mostrarNotificacionSistema,
  ]);

  // NUEVO EFECTO: Cargar notificaciones al montar el componente si está autenticado
  useEffect(() => {
    const cargarNotificacionesIniciales = async () => {
      if (estaAutenticado()) {
        console.log(
          "🔄 Cargando notificaciones iniciales al montar MenuPrincipal..."
        );
        await cargarNotificaciones();
      } else {
        console.log(
          "🔐 Usuario no autenticado, omitiendo carga inicial de notificaciones"
        );
      }
    };

    // Usar un pequeño timeout para asegurar que el componente esté completamente montado
    const timer = setTimeout(cargarNotificacionesIniciales, 100);

    return () => clearTimeout(timer);
  }, [estaAutenticado, cargarNotificaciones]); // Dependencias: cuando cambie la autenticación o la función

  // Agrega este useEffect adicional para manejar cambios en la autenticación
  useEffect(() => {
    const handleAuthChange = () => {
      if (!estaAutenticado()) {
        console.log("🔐 Usuario desautenticado, limpiando estado");
        setEstaConectado(false);
        setNotificaciones([]);
      }
    };

    // Escuchar cambios en el localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authToken" || e.key === "idUsuario") {
        handleAuthChange();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [estaAutenticado]);

  /**
   * Cargar notificaciones existentes cuando se abre el panel
   */
  useEffect(() => {
    if (notificacionesAbierto) {
      console.log(
        "📂 Panel de notificaciones abierto, cargando notificaciones..."
      );
      const timer = setTimeout(() => {
        cargarNotificaciones();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [notificacionesAbierto, cargarNotificaciones]);

  /**
   * Solicitar permisos para notificaciones del sistema al cargar el componente
   */
  useEffect(() => {
    console.log("🔔 Solicitando permisos para notificaciones...");
    const timer = setTimeout(() => {
      solicitarPermisosNotificaciones();
    }, 0);

    return () => clearTimeout(timer);
  }, [solicitarPermisosNotificaciones]);

  /**
   * Prevenir scroll cuando el menú móvil está abierto
   */
  useEffect(() => {
    if (menuAbierto) {
      document.body.style.overflow = "hidden";
      // Agregar event listener para cerrar menú con Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setMenuAbierto(false);
        }
      };
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuAbierto]);

  /**
   * Cerrar notificaciones al hacer click fuera del panel
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        notificacionesAbierto &&
        !target.closest(".notificaciones-container")
      ) {
        setNotificacionesAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificacionesAbierto]);

  // ==========================================================================
  // VARIABLES CALCULADAS
  // ==========================================================================

  /**
   * Calcular número de notificaciones no leídas
   */
  const notificacionesNoLeidas = notificaciones.filter(
    (notif) => !notif.leida
  ).length;

  // Estilos para la navegación
  const estiloBase =
    "px-3 py-2 rounded-md transition-colors flex items-center justify-center";
  const estiloActivo = "bg-blue-600 text-white";
  const estiloInactivo =
    "bg-custom-card text-custom-foreground hover:bg-gray-300 dark:hover:bg-gray-600 border border-custom-card";

  // Estilos para el menú móvil
  const estiloEnlaceMovil =
    "block py-4 text-xl font-medium border-b border-gray-200 dark:border-gray-700 transition-colors";
  const estiloActivoMovil = "text-blue-600 dark:text-blue-400";
  const estiloInactivoMovil =
    "text-custom-foreground hover:text-blue-600 dark:hover:text-blue-400";

  // Cerrar menú cuando cambia la ruta actual (sin useEffect)
  if (rutaActual !== rutaAnterior) {
    setMenuAbierto(false);
    setRutaAnterior(rutaActual);
  }

  // ==========================================================================
  // RENDERIZADO DEL COMPONENTE
  // ==========================================================================

  return (
    <header className="bg-custom-header border-b border-custom-header transition-colors duration-300">
      {/* Indicador de conexión WebSocket (solo en desarrollo) */}
      {process.env.NODE_ENV === "development" && (
        <div
          className={`text-xs text-center py-1 ${
            estaConectado ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {estaConectado
            ? "🔗 Conectado"
            : reconectando
              ? "🔄 Reconectando..."
              : "⚠️ Desconectado"}
        </div>
      )}

      {/* Navegación Desktop */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo y mensaje de bienvenida */}
          <div className="flex items-center space-x-4">
            <Image
              src="/img/logo_DPortfolio.png"
              alt="DPortfolio"
              width={50}
              height={50}
              className="h-10 w-auto"
              priority
            />
            {nombreUsuario && (
              <p className="text-sm text-custom-foreground">
                Hola, <span className="font-medium">{nombreUsuario}</span>
              </p>
            )}
          </div>

          {/* Navegación central */}
          <nav className="flex space-x-2 items-center">
            <Link
              href="/inicio"
              className={`${estiloBase} ${
                estaActiva("/inicio") ? estiloActivo : estiloInactivo
              }`}
            >
              Portfolio
            </Link>
            <Link
              href="/alertas"
              className={`${estiloBase} ${
                estaActiva("/alertas") ? estiloActivo : estiloInactivo
              }`}
            >
              Alertas
            </Link>
          </nav>

          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            {/* Botón de Notificaciones */}
            <div className="notificaciones-container relative">
              <button
                onClick={() => setNotificacionesAbierto(!notificacionesAbierto)}
                className={`p-3 rounded-md transition-colors relative ${
                  notificacionesAbierto
                    ? "bg-blue-600 text-white"
                    : "bg-custom-card text-custom-foreground hover:bg-gray-300 dark:hover:bg-gray-600 border border-custom-card"
                }`}
                title="Notificaciones"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </button>

              {/* Panel de Notificaciones (bocadillo) */}
              {notificacionesAbierto && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                  {/* Header del panel */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Notificaciones
                      </h3>
                      <span className="text-sm text-gray-500">
                        {notificacionesNoLeidas} sin leer
                      </span>
                    </div>
                  </div>

                  {/* Lista de notificaciones con scroll */}
                  <div className="max-h-80 overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No hay notificaciones
                      </div>
                    ) : (
                      notificaciones.map((notificacion) => (
                        <div
                          key={notificacion.id}
                          className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
                            !notificacion.leida
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                          onClick={() => marcarComoLeida(notificacion.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {obtenerIcono(notificacion.tipo)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium ${
                                  !notificacion.leida
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {notificacion.titulo}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {notificacion.mensaje}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                {new Date(notificacion.fecha).toLocaleString()}
                              </p>
                            </div>
                            {!notificacion.leida && (
                              <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer del panel - Marcarlas todas como leídas */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={marcarTodasComoLeidas}
                      disabled={notificacionesNoLeidas === 0}
                      className={`w-full text-center text-sm font-medium transition-colors ${
                        notificacionesNoLeidas > 0
                          ? "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                          : "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span>Marcar todas como leídas</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Botón Configuración */}
            <Link
              href="/configuracion"
              className={`p-3 rounded-md transition-colors ${
                estaActiva("/configuracion")
                  ? "bg-blue-600 text-white"
                  : "bg-custom-card text-custom-foreground hover:bg-gray-300 dark:hover:bg-gray-600 border border-custom-card"
              }`}
              title="Configuración"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>

            {/* Botón Cerrar Sesión */}
            <button
              onClick={manejarCerrarSesion}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-md transition-colors text-white border border-red-600"
              title="Cerrar sesión"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Mobile */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/img/logo_DPortfolio.png"
              alt="DPortfolio"
              width={40}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>

          {/* Botones de acción móviles */}
          <div className="flex items-center space-x-2">
            {/* Botón de Notificaciones móvil */}
            <button
              onClick={() => setNotificacionesAbierto(!notificacionesAbierto)}
              className="p-2 rounded-md bg-custom-card text-custom-foreground border border-custom-card relative"
              aria-label="Notificaciones"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {notificacionesNoLeidas > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notificacionesNoLeidas}
                </span>
              )}
            </button>

            {/* Botón hamburguesa */}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 rounded-md bg-custom-card text-custom-foreground border border-custom-card"
              aria-label="Menú principal"
            >
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute top-1 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    menuAbierto ? "rotate-45 top-3" : ""
                  }`}
                />
                <span
                  className={`absolute top-3 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    menuAbierto ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                    menuAbierto ? "-rotate-45 top-3" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Panel de Notificaciones Móvil (pantalla completa) */}
        {notificacionesAbierto && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
            {/* Header del panel móvil */}
            <div className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Notificaciones
              </h2>
              <button
                onClick={() => setNotificacionesAbierto(false)}
                className="p-2 text-gray-500 dark:text-gray-400"
                aria-label="Cerrar notificaciones"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Contenido del panel móvil con scroll */}
            <div className="container mx-auto px-4 py-4 h-[calc(100vh-140px)] overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p>No hay notificaciones</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        !notificacion.leida
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => marcarComoLeida(notificacion.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {obtenerIcono(notificacion.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium ${
                              !notificacion.leida
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-600 dark:text-gray-300"
                            }`}
                          >
                            {notificacion.titulo}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {notificacion.mensaje}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {new Date(notificacion.fecha).toLocaleString()}
                          </p>
                        </div>
                        {!notificacion.leida && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer móvil - Marcarlas todas como leídas */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <button
                onClick={marcarTodasComoLeidas}
                disabled={notificacionesNoLeidas === 0}
                className={`w-full py-3 text-center rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  notificacionesNoLeidas > 0
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Marcar todas como leídas</span>
              </button>
            </div>
          </div>
        )}

        {/* Menú desplegable móvil */}
        <div
          className={`fixed inset-0 bg-custom-background z-40 transition-transform duration-300 ease-in-out ${
            menuAbierto ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header del menú móvil */}
          <div className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <Image
              src="/img/logo_DPortfolio.png"
              alt="DPortfolio"
              width={40}
              height={40}
              className="h-8 w-auto"
              priority
            />
            <button
              onClick={() => setMenuAbierto(false)}
              className="p-2 text-custom-foreground"
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Contenido del menú móvil */}
          <div className="container mx-auto px-4 py-8">
            {/* Información del usuario */}
            {nombreUsuario && (
              <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                <p className="text-lg text-custom-foreground">
                  Hola, <span className="font-semibold">{nombreUsuario}</span>
                </p>
              </div>
            )}

            {/* Navegación principal */}
            <nav className="space-y-2 mb-8">
              <Link
                href="/inicio"
                className={`${estiloEnlaceMovil} ${
                  estaActiva("/inicio")
                    ? estiloActivoMovil
                    : estiloInactivoMovil
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  Portfolio
                </div>
              </Link>

              <Link
                href="/alertas"
                className={`${estiloEnlaceMovil} ${
                  estaActiva("/alertas")
                    ? estiloActivoMovil
                    : estiloInactivoMovil
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  Alertas
                </div>
              </Link>

              <Link
                href="/configuracion"
                className={`${estiloEnlaceMovil} ${
                  estaActiva("/configuracion")
                    ? estiloActivoMovil
                    : estiloInactivoMovil
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Configuración
                </div>
              </Link>
            </nav>

            {/* Botón de cerrar sesión */}
            <button
              onClick={() => {
                manejarCerrarSesion();
                setMenuAbierto(false);
              }}
              className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
