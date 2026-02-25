"use client";

import { useState, useMemo, useEffect } from "react";
import { useUserId } from "@/hooks/useUserId";
import Boton from "@/components/controles/Boton";
import Card from "@/components/controles/Card";
import {
  IconoPlay,
  IconoStop,
  IconoRefrescar,
} from "@/components/controles/Iconos";

const SIMBOLOS_SOPORTADOS = [
  "BTCUSDC",
  "ETHUSDC",
  "SOLUSDC",
  "ADAUSDC",
  "XRPUSDC",
  "BNBUSDC",
  "AVAXUSDC",
  "LINKUSDC",
  "DOGEUSDC",
];

const OPCIONES_INTERVALOS = ["1m", "3m", "5m", "15m"];

interface SimboloConfig {
  symbol: string;
  lowerLimit?: number | null;
  upperLimit?: number | null;
}

interface BotConfig {
  tradeAmountUSD?: number;
  intervals?: string[];
  simbolos?: SimboloConfig[]; // Cambiamos a array de objetos
  limit?: number;
  cooldownMinutes?: number;
  fechaActivacion?: string;
  maxInversion?: number;
}

interface EstadisticasBot {
  compras: number;
  ventas: number;
  totalOperaciones: number;
  operacionesPendientes: number;
  operacionesEmparejadas: number;
  operacionesUltimas24h: number;
  emparejadasUltimas24h: number;
  beneficio24h: number;
  beneficioTotal: number;
}

export default function BotPage() {
  const userId = useUserId();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Estados de UI
  const [botActivo, setBotActivo] = useState<boolean>(false); // switch ON/OFF
  const [iniciado, setIniciado] = useState<boolean>(false); // bot realmente ejecutándose

  // Configuración actual (para el formulario)
  const [monto, setMonto] = useState<number>(10);
  const [maximoInvertible, setMaximoInvertible] = useState<number>(100); // Maximo dinero a invertir por el bot
  const [intervalosSeleccionados, setIntervalosSeleccionados] = useState<
    string[]
  >([]);
  const [simbolosSeleccionados, setSimbolosSeleccionados] = useState<string[]>(
    []
  );
  const [limites, setLimites] = useState<
    Record<string, { lower: string; upper: string }>
  >({});

  // Configuración guardada (para mostrar en estadísticas)
  const [configMonto, setConfigMonto] = useState<number>(10);
  const [configMaximoInvertible, setConfigMaximoInvertible] =
    useState<number>(100); // NUEVO
  const [configIntervalos, setConfigIntervalos] = useState<string[]>([]);
  const [configSimbolosDetalle, setConfigSimbolosDetalle] = useState<
    SimboloConfig[]
  >([]);
  const [configFechaActivacion, setConfigFechaActivacion] = useState<
    string | null
  >(null);

  // Estadísticas del bot
  const [estadisticas, setEstadisticas] = useState<EstadisticasBot>({
    compras: 0,
    ventas: 0,
    totalOperaciones: 0,
    operacionesPendientes: 0,
    operacionesEmparejadas: 0,
    operacionesUltimas24h: 0,
    emparejadasUltimas24h: 0,
    beneficio24h: 0,
    beneficioTotal: 0,
  });
  const [cargandoEstadisticas, setCargandoEstadisticas] =
    useState<boolean>(false);

  const [cargando, setCargando] = useState<boolean>(false);
  const [cargandoEstado, setCargandoEstado] = useState<boolean>(true);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Cargar estado del bot al montar
  useEffect(() => {
    const fetchEstadoBot = async () => {
      if (!userId) {
        setCargandoEstado(false);
        return;
      }
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/atecnico/bot/estado/${userId}`
        );
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }
        const data = await response.json();
        if (data.activo) {
          // Bot activo en backend
          setIniciado(true);
          setBotActivo(true);
          // Cargar configuración (si el backend la devuelve)
          if (data.config) {
            setConfigMonto(data.config.tradeAmountUSD ?? 10);
            setConfigIntervalos(data.config.intervals ?? []);
            setConfigSimbolosDetalle(data.config.simbolos ?? []); // ← array de objetos
            setConfigMaximoInvertible(data.config.maxInversion ?? 100);
            setConfigFechaActivacion(data.config.fechaActivacion ?? null);
          }
        } else {
          // No activo
          setIniciado(false);
          setBotActivo(false);
        }
      } catch (error) {
        console.error("Error al obtener estado del bot:", error);
        // Si falla, asumimos que no está activo
        setIniciado(false);
        setBotActivo(false);
      } finally {
        setCargandoEstado(false);
      }
    };
    fetchEstadoBot();
  }, [userId, BACKEND_URL]);

  // Cargar estadísticas cuando el bot esté iniciado
  useEffect(() => {
    if (iniciado && userId) {
      cargarEstadisticas();
    } else {
      // Resetear estadísticas si se detiene
      setEstadisticas({
        compras: 0,
        ventas: 0,
        totalOperaciones: 0,
        operacionesPendientes: 0,
        operacionesEmparejadas: 0,
        operacionesUltimas24h: 0,
        emparejadasUltimas24h: 0,
        beneficio24h: 0,
        beneficioTotal: 0,
      });
    }
  }, [iniciado, userId]);

  const cargarEstadisticas = async () => {
    if (!userId) return;
    setCargandoEstadisticas(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/atecnico/bot/operaciones/${userId}`
      );
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setEstadisticas({
        compras: data.compras || 0,
        ventas: data.ventas || 0,
        totalOperaciones: data.totalOperaciones || 0,
        operacionesPendientes: data.operacionesPendientes || 0,
        operacionesEmparejadas: data.operacionesEmparejadas || 0,
        operacionesUltimas24h: data.operacionesUltimas24h || 0,
        emparejadasUltimas24h: data.emparejadasUltimas24h || 0,
        beneficio24h: data.beneficio24h || 0,
        beneficioTotal: data.beneficioTotal || 0,
      });
    } catch (error) {
      console.error("Error al cargar estadísticas del bot:", error);
      setMensaje("❌ Error al cargar estadísticas");
    } finally {
      setCargandoEstadisticas(false);
    }
  };

  const isValid = useMemo(() => {
    return (
      monto >= 5 &&
      maximoInvertible >= 10 &&
      intervalosSeleccionados.length > 0 &&
      simbolosSeleccionados.length > 0
    );
  }, [monto, maximoInvertible, intervalosSeleccionados, simbolosSeleccionados]);

  // Manejo del switch (solo cambia si el bot no está en ejecución)
  const toggleBot = () => {
    if (iniciado) return; // No se puede apagar manualmente mientras corre
    setBotActivo(!botActivo);
    setMensaje(null);
  };

  const handleIntervaloChange = (intervalo: string) => {
    setIntervalosSeleccionados((prev) =>
      prev.includes(intervalo)
        ? prev.filter((i) => i !== intervalo)
        : [...prev, intervalo]
    );
  };

  const handleSimboloChange = (simbolo: string) => {
    setSimbolosSeleccionados((prev) =>
      prev.includes(simbolo)
        ? prev.filter((s) => s !== simbolo)
        : [...prev, simbolo]
    );
  };

  const handleLowerChange = (simbolo: string, value: string) => {
    setLimites((prev) => ({
      ...prev,
      [simbolo]: { ...prev[simbolo], lower: value },
    }));
  };

  const handleUpperChange = (simbolo: string, value: string) => {
    setLimites((prev) => ({
      ...prev,
      [simbolo]: { ...prev[simbolo], upper: value },
    }));
  };

  const handleIniciarBot = async () => {
    if (!userId) {
      alert("Usuario no identificado");
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      // Construir array de símbolos con límites
      const simbolosConLimites = simbolosSeleccionados.map((simbolo) => {
        const lower = limites[simbolo]?.lower;
        const upper = limites[simbolo]?.upper;
        return {
          symbol: simbolo,
          // Si el campo está vacío se envía null; si tiene valor se parsea a número
          lowerLimit: lower && lower.trim() !== "" ? parseFloat(lower) : null,
          upperLimit: upper && upper.trim() !== "" ? parseFloat(upper) : null,
        };
      });

      const response = await fetch(`${BACKEND_URL}/api/atecnico/bot/activar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tradeAmountUSD: monto,
          intervals: intervalosSeleccionados.join(","), // si el backend espera string
          simbolos: simbolosConLimites, // nuevo formato con límites
          limit: 50,
          cooldownMinutes: 3,
          maxInversion: maximoInvertible,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log("Bot activado:", data);

      // Guardar configuración actual (puedes guardar también los límites si lo deseas)
      setConfigMonto(monto);
      setConfigIntervalos(intervalosSeleccionados);
      setConfigSimbolosDetalle(simbolosConLimites);
      setConfigMaximoInvertible(maximoInvertible);
      setConfigFechaActivacion(new Date().toISOString()); // o si el backend devuelve fecha, úsala

      setMensaje("✅ Bot iniciado correctamente");
      setIniciado(true);
    } catch (error: unknown) {
      console.error("Error al iniciar bot:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setMensaje(`❌ ${errorMessage}`);
    } finally {
      setCargando(false);
    }
  };

  const handleDetenerBot = async () => {
    if (!userId) {
      alert("Usuario no identificado");
      return;
    }

    setCargando(true);
    setMensaje(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/atecnico/bot/desactivar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log("Bot desactivado:", data);

      setMensaje("✅ Bot detenido correctamente");
      setIniciado(false);
      setBotActivo(false); // Volver a pantalla de desactivado
    } catch (error: unknown) {
      console.error("Error al detener bot:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setMensaje(`❌ ${errorMessage}`);
    } finally {
      setCargando(false);
    }
  };

  if (cargandoEstado) {
    return (
      <main className="container mx-auto p-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--colorTerciario)]"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold title-custom-foreground">
            Bot de Señales
          </h1>
          <p className="text-sm text-custom-foreground/70 mt-1">
            Configura y controla el bot automático de trading basado en señales
            técnicas.
          </p>
        </div>

        {/* Switch ON/OFF */}
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium ${!botActivo ? "text-green-500" : "text-custom-foreground/70"}`}
          >
            OFF
          </span>
          <button
            onClick={toggleBot}
            disabled={iniciado}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)] focus:ring-offset-2 ${
              botActivo ? "bg-green-600" : "bg-gray-400"
            } ${iniciado ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                botActivo ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${botActivo ? "text-green-500" : "text-custom-foreground/70"}`}
          >
            ON
          </span>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="bg-surface rounded-lg border border-card-border p-6">
        {!botActivo && !iniciado ? (
          // Pantalla de bot desactivado
          <div className="text-center py-12">
            <div className="text-custom-foreground/50 text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-custom-foreground mb-2">
              Bot desactivado
            </h3>
            <p className="text-custom-foreground/70 mb-6">
              Activa el bot para configurar los parámetros y comenzar a operar
              automáticamente.
            </p>
          </div>
        ) : botActivo && !iniciado ? (
          // Formulario de configuración (switch ON pero no ejecutándose)
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-custom-foreground mb-4">
              Configuración del Bot
            </h2>

            {/* Monto por orden */}
            <div>
              <label
                htmlFor="monto"
                className="block text-sm font-medium text-custom-foreground/70 mb-2"
              >
                Monto por orden (USDC)
              </label>
              <input
                type="number"
                id="monto"
                min="5"
                step="1"
                value={monto}
                onChange={(e) => setMonto(Number(e.target.value))}
                className="w-full md:w-64 px-3 py-2 bg-[var(--background)] border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)]"
              />
              <p className="text-xs text-custom-foreground/50 mt-1">
                Mínimo <strong>5 USDC</strong> por orden.
              </p>
            </div>

            {/* Marcos temporales */}
            <div>
              <span className="block text-sm font-medium text-custom-foreground/70 mb-2">
                Marcos temporales (selecciona al menos uno)
              </span>
              <div className="flex flex-wrap gap-4">
                {OPCIONES_INTERVALOS.map((intervalo) => (
                  <label
                    key={intervalo}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={intervalosSeleccionados.includes(intervalo)}
                      onChange={() => handleIntervaloChange(intervalo)}
                      className="w-4 h-4 text-[var(--colorTerciario)] bg-[var(--background)] border-card-border rounded focus:ring-[var(--colorTerciario)]"
                    />
                    <span className="text-sm text-custom-foreground">
                      {intervalo}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Símbolos */}
            <div>
              <span className="block text-sm font-medium text-custom-foreground/70 mb-2">
                Símbolos (selecciona al menos uno)
              </span>
              <div className="space-y-3">
                {SIMBOLOS_SOPORTADOS.map((simbolo) => (
                  <div
                    key={simbolo}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
                  >
                    <div className="flex items-center space-x-2 w-32">
                      <input
                        type="checkbox"
                        checked={simbolosSeleccionados.includes(simbolo)}
                        onChange={() => handleSimboloChange(simbolo)}
                        className="w-4 h-4 text-[var(--colorTerciario)] bg-[var(--background)] border-card-border rounded focus:ring-[var(--colorTerciario)]"
                      />
                      <span className="text-sm text-custom-foreground">
                        {simbolo}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-custom-foreground/70">
                          Inf:
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={limites[simbolo]?.lower ?? ""}
                          onChange={(e) =>
                            handleLowerChange(simbolo, e.target.value)
                          }
                          className="w-24 px-2 py-1 text-sm bg-[var(--background)] border border-card-border rounded focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)]"
                          placeholder="Límite inf"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-custom-foreground/70">
                          Sup:
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={limites[simbolo]?.upper ?? ""}
                          onChange={(e) =>
                            handleUpperChange(simbolo, e.target.value)
                          }
                          className="w-24 px-2 py-1 text-sm bg-[var(--background)] border border-card-border rounded focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)]"
                          placeholder="Límite sup"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Máximo invertible */}
            <div>
              <label
                htmlFor="maximoInvertible"
                className="block text-sm font-medium text-custom-foreground/70 mb-2"
              >
                Máximo invertible (USDC)
              </label>
              <input
                type="number"
                id="maximoInvertible"
                min="10"
                step="10"
                value={maximoInvertible}
                onChange={(e) => setMaximoInvertible(Number(e.target.value))}
                className="w-full md:w-64 px-3 py-2 bg-[var(--background)] border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)]"
              />
              <p className="text-xs text-custom-foreground/50 mt-1">
                Capital máximo a utilizar por el bot.
              </p>
            </div>

            {/* Mensaje de resultado */}
            {mensaje && (
              <div
                className={`text-sm p-2 rounded ${mensaje.startsWith("✅") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
              >
                {mensaje}
              </div>
            )}

            {/* Botón iniciar */}
            <div className="pt-4">
              <Boton
                texto={
                  <div className="flex items-center space-x-2">
                    {cargando ? (
                      <span>Cargando...</span>
                    ) : (
                      <>
                        <IconoPlay />
                        <span>Iniciar Bot</span>
                      </>
                    )}
                  </div>
                }
                onClick={handleIniciarBot}
                disabled={!isValid || cargando}
              />
              {!isValid && !cargando && (
                <p className="text-xs text-red-500 mt-2">
                  Debes seleccionar al menos un marco temporal, un símbolo y un
                  monto mínimo de 5 USDC.
                </p>
              )}
            </div>
          </div>
        ) : (
          // Panel de estadísticas (bot en ejecución)
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <h2 className="text-xl font-semibold text-custom-foreground">
                Bot en ejecución
              </h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <Boton
                  texto={
                    <div className="flex items-center space-x-2">
                      {cargandoEstadisticas ? (
                        <span className="animate-spin">⟳</span>
                      ) : (
                        <IconoRefrescar />
                      )}
                      <span>Refrescar</span>
                    </div>
                  }
                  onClick={cargarEstadisticas}
                  disabled={cargandoEstadisticas}
                />
                <Boton
                  texto={
                    <div className="flex items-center space-x-2">
                      {cargando ? (
                        <span>Cargando...</span>
                      ) : (
                        <>
                          <IconoStop />
                          <span>Detener Bot</span>
                        </>
                      )}
                    </div>
                  }
                  onClick={handleDetenerBot}
                  disabled={cargando}
                  className="bg-red-600 hover:bg-red-700 text-white"
                />
              </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                titulo="Total operaciones"
                contenido={{ texto: estadisticas.totalOperaciones }}
              />
              <Card
                titulo="Operaciones emparejadas"
                contenido={{ texto: estadisticas.operacionesEmparejadas }}
              />
              <Card
                titulo="Operaciones 24h"
                contenido={{ texto: estadisticas.operacionesUltimas24h }}
              />
              <Card
                titulo="Operaciones emparejadas 24h"
                contenido={{ texto: estadisticas.emparejadasUltimas24h }}
              />
              <Card
                titulo="Beneficio total"
                contenido={{
                  texto: estadisticas.beneficioTotal.toFixed(2),
                  color: "#10b981", // verde-500
                }}
              />
              <Card
                titulo="Beneficio 24h"
                contenido={{
                  texto: estadisticas.beneficio24h.toFixed(2),
                  color: "#10b981",
                }}
              />
              <Card
                titulo="Operaciones pendientes"
                contenido={{
                  texto: estadisticas.operacionesPendientes,
                  color: "#f59e0b", // ámbar-500
                }}
              />
            </div>

            {/* Configuración actual */}
            <div className="mt-4 p-4 bg-[var(--background)] rounded-lg border border-card-border">
              <h3 className="text-md font-medium text-custom-foreground mb-2">
                Configuración activa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-custom-foreground/70">
                    Monto por orden:
                  </span>{" "}
                  <span className="font-medium">{configMonto} USDC</span>
                </div>
                <div>
                  <span className="text-custom-foreground/70">
                    Máximo invertible:
                  </span>{" "}
                  <span className="font-medium">
                    {configMaximoInvertible} USDC
                  </span>
                </div>
                <div>
                  <span className="text-custom-foreground/70">Intervalos:</span>{" "}
                  <span className="font-medium">
                    {configIntervalos.join(", ")}
                  </span>
                </div>
                <div>
                  <span className="text-custom-foreground/70">
                    Activado el:
                  </span>{" "}
                  <span className="font-medium">
                    {configFechaActivacion
                      ? new Date(configFechaActivacion).toLocaleString()
                      : "Desconocido"}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <span className="text-custom-foreground/70 block mb-1">
                  Símbolos con límites:
                </span>
                <div className="space-y-2">
                  {configSimbolosDetalle.length > 0 ? (
                    configSimbolosDetalle.map((item) => (
                      <div
                        key={item.symbol}
                        className="flex items-center gap-4 text-sm"
                      >
                        <span className="font-medium w-24">{item.symbol}</span>
                        <span className="text-custom-foreground/70">
                          Inf: {item.lowerLimit ?? "—"}
                        </span>
                        <span className="text-custom-foreground/70">
                          Sup: {item.upperLimit ?? "—"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-custom-foreground/50">
                      No disponibles
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mensaje de resultado */}
            {mensaje && (
              <div
                className={`text-sm p-2 rounded ${mensaje.startsWith("✅") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
              >
                {mensaje}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="mt-6 text-sm text-custom-foreground/60">
        <p className="mb-1">
          💡 <strong>Importante:</strong> El bot operará con los símbolos
          seleccionados y los marcos temporales indicados.
        </p>
        <p>
          ⚠️ Asegúrate de tener fondos suficientes en USDC antes de iniciar.
        </p>
      </div>
    </main>
  );
}
