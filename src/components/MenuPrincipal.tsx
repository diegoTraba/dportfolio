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
import {
  IconoAlerta,
  IconoSistema,
  IconoDefecto,
  IconoCampana,
  IconoEngranaje,
  IconoCerrarSesion,
  IconoPortfolio,
  IconoMarcarLeidas,
  IconoCerrar,
  IconoMenu,
} from "./controles/Iconos";
// Interfaces
import { Notificacion, WSMessage } from "../interfaces/comun.types";

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

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Inicializar el nombre del usuario directamente en useState
  const [nombreUsuario, setNombreUsuario] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nombreUsuario") || "";
    }
    return "";
  });

  // ==========================================================================
  // FUNCIONES PRINCIPALES - Usando useCallback para memorización
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
  }, [BACKEND_URL, obtenerHeaders, estaAutenticado, manejarTokenInvalido]);

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
        return <IconoAlerta className="text-red-500" />;
      case "sistema":
        return <IconoSistema className="text-blue-500" />;
      default:
        return <IconoDefecto className="text-gray-500" />;
    }
  }, []);

  /**
   * Verificar si una ruta está activa
   */
  const estaActiva = useCallback(
    (ruta: string) => {
      // Si es la ruta de portfolio, activar también para sus subrutas
      if (ruta === "/portfolio") {
        return rutaActual === ruta || rutaActual.startsWith(ruta + '/');
      }
      
      // Para otras rutas, comportamiento normal (comparación exacta)
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
  // EFECTOS (useEffect)
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

  // EFECTO PRINCIPAL DEL WEBSOCKET
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
    <header className="fixed top-0 left-0 right-0 bg-custom-header border-b border-custom-header transition-colors duration-300 z-50">
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

      {/* Navegación Desktop - ALTURA AJUSTADA A 66px */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 h-[66px] flex items-center justify-between">
          {/* Logo y mensaje de bienvenida */}
          <div className="flex items-center space-x-4">
            <Link href="/portfolio" className="flex items-center">
              <Image
                src="/img/logo_DPortfolio.png"
                alt="DPortfolio"
                width={50}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>
            {nombreUsuario && (
              <p className="text-sm text-custom-foreground">
                Hola, <span className="font-medium">{nombreUsuario}</span>
              </p>
            )}
          </div>

          {/* Navegación central */}
          <nav className="flex space-x-6 items-center">
            <Link
              href="/portfolio"
              className={`menu-link flex items-center ${estaActiva("/portfolio") ? 'active' : ''}`}
            >
              <IconoPortfolio className="w-5 h-5 mr-2" />
              Portfolio
            </Link>
            <Link
              href="/alertas"
              className={`menu-link flex items-center ${estaActiva("/alertas") ? 'active' : ''}`}
            >
              <IconoCampana className="w-5 h-5 mr-2" />
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
                    : "bg-custom-card text-custom-foreground hover:bg-custom-surface border border-custom-card"
                }`}
                title="Notificaciones"
              >
                <IconoCampana className="w-6 h-6" />
                {notificacionesNoLeidas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificacionesNoLeidas}
                  </span>
                )}
              </button>

              {/* Panel de Notificaciones (bocadillo) */}
              {notificacionesAbierto && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-custom-card border border-custom-border rounded-lg shadow-xl z-50">
                  {/* Header del panel */}
                  <div className="p-4 border-b border-custom-border">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-custom-foreground">
                        Notificaciones
                      </h3>
                      <span className="text-sm text-custom-foreground/70">
                        {notificacionesNoLeidas} sin leer
                      </span>
                    </div>
                  </div>

                  {/* Lista de notificaciones con scroll */}
                  <div className="max-h-80 overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="p-4 text-center text-custom-foreground/70">
                        No hay notificaciones
                      </div>
                    ) : (
                      notificaciones.map((notificacion) => (
                        <div
                          key={notificacion.id}
                          className={`p-4 border-b border-custom-border cursor-pointer transition-colors ${
                            !notificacion.leida
                              ? "bg-blue-50 dark:bg-blue-900/20"
                              : "hover:bg-custom-surface"
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
                  <div className="p-3 border-t border-custom-border">
                    <button
                      onClick={marcarTodasComoLeidas}
                      disabled={notificacionesNoLeidas === 0}
                      className={`w-full bg-custom-accent hover:bg-custom-accent-hover text-center text-sm font-medium transition-colors ${
                        notificacionesNoLeidas > 0
                          ? "text-custom-accent hover:text-custom-accent-hover"
                          : "text-custom-foreground/30 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <IconoMarcarLeidas className="w-4 h-4" />
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
                  : "bg-custom-card text-custom-foreground hover:bg-custom-surface border border-custom-card"
              }`}
              title="Configuración"
            >
              <IconoEngranaje className="w-6 h-6" />
            </Link>

            {/* Botón Cerrar Sesión */}
            <button
              onClick={manejarCerrarSesion}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-md transition-colors text-white border border-red-600"
              title="Cerrar sesión"
            >
              <IconoCerrarSesion className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Mobile - SE MANTIENE IGUAL */}
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
              <IconoCampana className="w-6 h-6" />
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
              <IconoMenu isOpen={menuAbierto} />
            </button>
          </div>
        </div>

        {/* El resto del código móvil se mantiene igual... */}
        {/* Panel de Notificaciones Móvil (pantalla completa) */}
        {notificacionesAbierto && (
          <div className="fixed inset-0 bg-custom-background z-50">
            {/* Header del panel móvil */}
            <div className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-custom-border">
              <h2 className="text-xl font-semibold text-custom-foreground">
                Notificaciones
              </h2>
              <button
                onClick={() => setNotificacionesAbierto(false)}
                className="p-2 text-custom-foreground/70"
                aria-label="Cerrar notificaciones"
              >
                <IconoCerrar className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido del panel móvil con scroll */}
            <div className="container mx-auto px-4 py-4 h-[calc(100vh-140px)] overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="text-center py-8 text-custom-foreground/70">
                  <IconoCampana className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
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
                          : "bg-custom-card border-custom-border"
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
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-custom-border bg-custom-background">
              <button
                onClick={marcarTodasComoLeidas}
                disabled={notificacionesNoLeidas === 0}
                className={`w-full py-3 text-center rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                  notificacionesNoLeidas > 0
                    ? "bg-custom-accent hover:bg-custom-accent-hover text-white"
                    : "bg-custom-card text-custom-foreground/50 cursor-not-allowed"
                }`}
              >
                <IconoMarcarLeidas className="w-5 h-5" />
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
          <div className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-custom-border">
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
              <IconoCerrar className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido del menú móvil */}
          <div className="container mx-auto px-4 py-8">
            {/* Información del usuario */}
            {nombreUsuario && (
              <div className="mb-8 pb-6 border-b border-custom-border">
                <p className="text-lg text-custom-foreground">
                  Hola, <span className="font-semibold">{nombreUsuario}</span>
                </p>
              </div>
            )}

            {/* Navegación principal */}
            <nav className="space-y-2 mb-8">
              <Link
                href="/portfolio"
                className={`${estiloEnlaceMovil} ${
                  estaActiva("/portfolio")
                    ? "bg-custom-accent text-white"
                    : "bg-custom-card text-custom-foreground hover:bg-custom-surface"
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <div className="flex items-center">
                  <IconoPortfolio className="w-5 h-5 mr-3" />
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
                  <IconoCampana className="w-5 h-5 mr-3" />
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
                  <IconoEngranaje className="w-5 h-5 mr-3" />
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
              <IconoCerrarSesion className="w-5 h-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
