// app/inicio/page.tsx
"use client";

import { useState, useEffect } from "react";
import Card from "@/components/controles/Card";
import Surface from "@/components/controles/Surface";
import Boton from "@/components/controles/Boton";
import ModalBinance from "@/components/modales/ModalBinance";
import { useUserId } from "@/hooks/useUserId";
import {
  IconoCheck,
  IconoLink,
  IconoCargando,
  IconoAviso,
} from "@/components/controles/Iconos";

// Interfaces
import {Alerta} from "@/interfaces/comun.types"
import {BalanceData} from "@/interfaces/cripto.types"


export default function Portfolio() {
  // ===========================================================================
  // ESTADOS Y HOOKS
  // ===========================================================================

  /**
   * ESTADO: Controla si el modal de conexión Binance está abierto/cerrado
   */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * ESTADO: Almacena todos los datos relacionados con el balance del usuario
   * - Valores iniciales: Balance 0, no conectado, 0 exchanges, cargando
   */
  const [balanceData, setBalanceData] = useState<BalanceData>({
    totalBalance: 0,
    connected: false,
    exchangesCount: 0,
    loading: true,
  });

  /**
   * ESTADO: Almacena las alertas del usuario
   */
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertasLoading, setAlertasLoading] = useState(true);

  /**
   * HOOK: Obtener el ID del usuario desde el contexto de autenticación
   * - Retorna null si no hay usuario autenticado
   * - Se usa para hacer llamadas a la API específicas del usuario
   */
  const userId = useUserId();

  // ===========================================================================
  // EFECTOS (useEffect)
  // ===========================================================================

  /**
   * EFFECT: Cargar datos iniciales del balance al montar el componente
   *
   * Se ejecuta cuando:
   * - El componente se monta por primera vez
   * - El userId cambia (cuando el usuario inicia/cierra sesión)
   *
   * Realiza una llamada a la API para obtener el balance actual del usuario
   */
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Activar estado de carga para mostrar feedback al usuario
        setBalanceData((prev) => ({ ...prev, loading: true }));

        // Si no hay usuario autenticado, resetear datos y salir
        if (!userId) {
          setBalanceData({
            totalBalance: 0,
            connected: false,
            exchangesCount: 0,
            loading: false,
          });
          return;
        }

        // LLAMADA A LA API: Obtener balance del usuario desde Binance
        const response = await fetch(
          `https://dportfolio-backend-production.up.railway.app/api/binance/balance/${userId}`
        );
        const data = await response.json();

        // Si la respuesta es exitosa, actualizar el estado con los datos
        if (response.ok) {
          setBalanceData({
            totalBalance: data.totalUSD || 0, // Balance total en USD
            connected: data.connected || false, // Si está conectado a algún exchange
            exchangesCount: data.exchangesCount || 0, // Número de exchanges conectados
            loading: false, // Quitar estado de carga
          });
          console.log(balanceData);
        } else {
          // Si la API devuelve error, lanzar excepción
          throw new Error(data.error || "Error al cargar datos");
        }
      } catch (error) {
        // MANEJO DE ERRORES: En caso de error, resetear datos y mostrar estado por defecto
        console.error("Error fetching balance:", error);
        setBalanceData({
          totalBalance: 0,
          connected: false,
          exchangesCount: 0,
          loading: false,
        });
      }
    };

    // Ejecutar la función de carga de datos
    loadInitialData();
  }, [userId]); // Dependencia: se ejecuta cuando userId cambia

  /**
   * EFFECT: Cargar alertas del usuario
   */
  useEffect(() => {
    const cargarAlertas = async () => {
      try {
        setAlertasLoading(true);

        if (!userId) {
          setAlertas([]);
          setAlertasLoading(false);
          return;
        }

        const response = await fetch(
          `https://dportfolio-backend-production.up.railway.app/api/alertas/${userId}`
        );

        if (response.ok) {
          const data = await response.json();
          setAlertas(data);
        } else {
          console.error("Error cargando alertas:", response.statusText);
          setAlertas([]);
        }
      } catch (err) {
        console.error("Error cargando alertas:", err);
        setAlertas([]);
      } finally {
        setAlertasLoading(false);
      }
    };

    cargarAlertas();
  }, [userId]);

  // ===========================================================================
  // FUNCIONES DE MANEJO DE EVENTOS
  // ===========================================================================

  /**
   * FUNCIÓN: Conectar cuenta de Binance con API Key y Secret
   *
   * Esta función:
   * 1. Envía las credenciales a la API para validarlas
   * 2. Si son válidas, guarda la conexión en la base de datos
   * 3. Actualiza el estado local con los nuevos datos
   *
   * @param apiKey - API Key de Binance del usuario
   * @param apiSecret - API Secret de Binance del usuario
   */
  const handleConnectBinance = async (apiKey: string, apiSecret: string) => {
    try {
      // Activar estado de carga
      setBalanceData((prev) => ({ ...prev, loading: true }));

      // Validar que hay un usuario autenticado
      if (!userId) {
        throw new Error(
          "No se encontró el usuario. Por favor, inicia sesión nuevamente."
        );
      }

      // LLAMADA A LA API: Conectar cuenta de Binance
      const response = await fetch(
        "https://dportfolio-backend-production.up.railway.app/api/binance/connect",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            apiKey,
            apiSecret,
            userId,
          }),
        }
      );

      // Procesar respuesta de la API
      const data = await response.json();

      // Si la API devuelve error, lanzar excepción
      if (!response.ok) {
        throw new Error(
          data.error || `Error ${response.status}: ${response.statusText}`
        );
      }

      // ÉXITO: Actualizar estado con los nuevos datos de Binance
      setBalanceData({
        totalBalance: data.totalBalance || 0, // Nuevo balance total
        connected: true, // Ahora está conectado
        exchangesCount: 1, // Tiene 1 exchange conectado
        loading: false, // Quitar estado de carga
      });
    } catch (error) {
      // ERROR: Mostrar en consola y quitar estado de carga
      console.error("Error completo connecting Binance:", error);
      setBalanceData((prev) => ({ ...prev, loading: false }));

      // Relanzar error para que el modal lo maneje
      throw error;
    }
  };

  /**
   * FUNCIÓN: Formatear balance numérico a formato de moneda USD
   *
   * Convierte un número (ej: 1500.5) a formato de moneda (ej: $1,500.50)
   *
   * @param balance - Balance numérico a formatear
   * @returns String formateado como moneda USD
   */
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(balance);
  };

  /**
   * FUNCIÓN: Determinar color del balance según el estado de conexión
   *
   * - Gris (#6B7280) cuando está cargando
   * - Verde (#10B981) cuando está conectado y cargado
   * - Gris (#6B7280) cuando no está conectado
   *
   * @param connected - Si el usuario tiene exchanges conectados
   * @param loading - Si está en estado de carga
   * @returns Color hexadecimal como string
   */
  const getBalanceColor = (connected: boolean, loading: boolean) => {
    if (loading) return "#6B7280"; // Gris para estado de carga
    return connected ? "#10B981" : "#6B7280"; // Verde si conectado, gris si no
  };

  /**
   * FUNCIÓN: Determinar color para las alertas
   */
  const getAlertasColor = (totalAlertas: number, loading: boolean) => {
    if (loading) return "#6B7280"; // Gris para estado de carga
    if (totalAlertas > 0) return "#10B981"; // Verde si hay alertas (igual que las otras cards)
    return "#6B7280"; // Gris si no hay alertas
  };

  /**
   * FUNCIÓN: Contar alertas pendientes
   */
  const contarAlertasPendientes = () => {
    return alertas.filter((alerta) => alerta.estado === "pendiente").length;
  };

  /**
   * FUNCIÓN: Contar alertas activadas
   */
  const contarAlertasActivadas = () => {
    return alertas.filter((alerta) => alerta.estado === "activo").length;
  };

  /**
   * FUNCIÓN: Abrir modal de conexión Binance
   *
   * Valida que haya un usuario autenticado antes de abrir el modal
   */
  const handleOpenModal = () => {
    if (!userId) {
      alert("No se encontró el usuario. Por favor, inicia sesión nuevamente.");
      return;
    }
    setIsModalOpen(true);
  };

  // ===========================================================================
  // RENDERIZADO DE LA PÁGINA
  // ===========================================================================
  return (
    <>
    {/* Contenido de las páginas */}
    <main className="container mx-auto p-4">
      {/* 
            SECCIÓN: CARDS DE RESUMEN
            Muestra información clave en formato de tarjetas
          */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 
              CARD: Balance Total
              Muestra el balance total del usuario en todas sus cuentas
            */}
        <Card
          titulo="Balance Total"
          contenido={{
            // Texto: Muestra "Cargando..." o el balance formateado
            texto: balanceData.loading
              ? "Cargando..."
              : formatBalance(balanceData.totalBalance),
            // Color: Cambia según estado de conexión y carga
            color: getBalanceColor(balanceData.connected, balanceData.loading),
            // Subtítulo: Estado de conexión con icono
            subtitulo: balanceData.connected ? (
              <span className="text-green-600">
                <IconoCheck className="text-green-500" />
                Conectado a Binance (Spot y Earn)
              </span>
            ) : (
              "Conecta un exchange para empezar"
            ),
          }}
        />

        {/* 
              CARD: Exchanges Conectados
              Muestra cuántos exchanges tiene conectados el usuario
            */}
        <Card
          titulo="Exchanges Conectados"
          contenido={{
            // Texto: Muestra "..." durante carga o el número de exchanges
            texto: balanceData.loading
              ? "..."
              : balanceData.exchangesCount.toString(),
            // Color: Verde si tiene exchanges, gris si no
            color: balanceData.exchangesCount > 0 ? "#10B981" : "#6B7280",
          }}
        />

        {/* 
              CARD: Alertas Activas
              Placeholder para futura funcionalidad de alertas
            */}
        <Card
          titulo="Alertas"
          contenido={{
            texto: alertasLoading
              ? "..."
              : (
                  contarAlertasPendientes() + contarAlertasActivadas()
                ).toString(),
            color: getAlertasColor(
              contarAlertasPendientes() + contarAlertasActivadas(),
              alertasLoading
            ),
            subtitulo: !alertasLoading && (
              <div className="space-y-1">
                {contarAlertasPendientes() > 0 && (
                  <div className="text-amber-600">
                    {contarAlertasPendientes()} pendientes
                  </div>
                )}
                {contarAlertasActivadas() > 0 && (
                  <div className="text-blue-600">
                    {contarAlertasActivadas()} activadas
                  </div>
                )}
                {contarAlertasPendientes() + contarAlertasActivadas() === 0 && (
                  <div className="text-gray-600">
                    No hay alertas configuradas
                  </div>
                )}
              </div>
            ),
          }}
        />
      </div>

      {/* 
            SECCIÓN: CONEXIÓN DE EXCHANGES
            Permite al usuario conectar sus cuentas de exchanges
          */}
      <Surface
        titulo="Conectar Exchange"
        descripcion="Conecta tus exchanges para comenzar a monitorear tus inversiones de forma segura"
      >
        {/* CONTENEDOR DE BOTONES DE EXCHANGES */}
        <div className="flex flex-wrap gap-4">
          {/* 
                BOTÓN: Binance
                - Con colores amarillo y negro de la marca
                - Cambia de estado según conexión
                - Deshabilitado cuando ya está conectado o está cargando
              */}
          <Boton
            texto={
              balanceData.connected ? (
                // Estado: Conectado - Muestra check y texto
                <span>
                  <IconoCheck />
                  Binance Conectado
                </span>
              ) : balanceData.loading ? (
                // Estado: Cargando - Muestra spinner y texto
                <span>
                  <IconoCargando />
                  Conectando...
                </span>
              ) : (
                // Estado: Desconectado - Muestra icono de enlace y texto
                <span>
                  <IconoLink />
                  Conectar Binance
                </span>
              )
            }
            // Colores específicos de Binance (amarillo/negro)
            colorFondo={!balanceData.connected ? "#F0B90B" : undefined}
            colorHover={!balanceData.connected ? "#D4A90A" : undefined}
            colorTexto={!balanceData.connected ? "black" : undefined}
            // Mantener colores incluso cuando está deshabilitado
            colorFondoDisabled="#F0B90B"
            colorTextoDisabled="black"
            tamaño="mediano"
            onClick={handleOpenModal}
            disabled={balanceData.connected || balanceData.loading || !userId}
            loading={balanceData.loading}
          />

          {/* 
                BOTÓN: Kraken (PRÓXIMAMENTE)
                - Con colores púrpura de la marca
                - Actualmente deshabilitado
                - Placeholder para futura implementación
              */}
          <Boton
            texto={
              <span>
                <IconoLink />
                Conectar Kraken
              </span>
            }
            // Colores específicos de Kraken (púrpura/blanco)
            colorFondo="#5642ae"
            colorHover="#483899"
            colorTexto="white"
            colorFondoDisabled="#5642ae"
            colorTextoDisabled="white"
            tamaño="mediano"
            disabled={true} // Deshabilitado hasta implementación
          />

          {/* 
                BOTÓN: Coinbase (PRÓXIMAMENTE)
                - Con colores azul de la marca
                - Actualmente deshabilitado
                - Placeholder para futura implementación
              */}
          <Boton
            texto={
              <span>
                <IconoLink />
                Conectar Coinbase
              </span>
            }
            // Colores específicos de Coinbase (azul/blanco)
            colorFondo="#0052FF"
            colorHover="#0046d9"
            colorTexto="white"
            colorFondoDisabled="#0052FF"
            colorTextoDisabled="white"
            tamaño="mediano"
            disabled={true} // Deshabilitado hasta implementación
          />
        </div>

        {/* 
              MENSAJE: Usuario no autenticado
              Se muestra cuando no se detecta una sesión de usuario activa
            */}
        {!userId && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              <IconoAviso className="text-yellow-500" />
              No se encontró la sesión del usuario. Por favor, inicia sesión
              nuevamente.
            </p>
          </div>
        )}

        {/* 
              MENSAJE: Conexión exitosa
              Se muestra cuando Binance se conecta correctamente
            */}
        {balanceData.connected && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              <IconoCheck className="text-green-500" />
              Binance conectado correctamente. Tu balance se actualizará
              automáticamente.
            </p>
          </div>
        )}
      </Surface>    
      </main>
      {/* 
          MODAL: Conexión Binance
          Se abre cuando el usuario hace clic en "Conectar Binance"
          Permite ingresar API Key y Secret de forma segura
         */}
      <ModalBinance
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={handleConnectBinance}
      />
    </>
  );
}
