"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hooks/useUserId";
import Boton from "@/components/controles/Boton";
import TablaVentas from "@/components/controles/tablas/TablaVentas";
import { Venta } from "@/interfaces/comun.types";
import { IconoRefrescar, IconoDolar, IconoBuscar } from "@/components/controles/Iconos";

export default function Ventas() {
  const userId = useUserId();
  const navegador = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recargar, setRecargar] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Filtrar ventas según el término de búsqueda (por símbolo o exchange)
  const filteredVentas = useMemo(() => {
    if (!searchTerm.trim()) return ventas;
    const term = searchTerm.toLowerCase().trim();
    return ventas.filter(
      (venta) =>
        venta.simbolo?.toLowerCase().includes(term) ||
        venta.exchange?.toLowerCase().includes(term)
    );
  }, [ventas, searchTerm]);

  // Función para cargar las ventas desde el backend
  const cargarVentas = useCallback(async () => {
    if (!userId) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);

      const response = await fetch(
        `${BACKEND_URL}/api/usuario/${userId}/cargarventas`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      console.log("📊 Datos de ventas recibidos:", data);

      // Verificar la estructura de la respuesta
      if (data.success && Array.isArray(data.data)) {
        setVentas(data.data);
      } else if (Array.isArray(data.data)) {
        // Si el endpoint devuelve directamente el array
        setVentas(data.data);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (err) {
      console.error("Error al cargar ventas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al cargar las ventas. Por favor, intenta nuevamente."
      );
    } finally {
      setCargando(false);
    }
  }, [userId, BACKEND_URL]);

  // Cargar ventas al montar el componente o cuando cambie el userId
  useEffect(() => {
    cargarVentas();
  }, [cargarVentas]);

  // Efecto para recargar cuando se active la bandera recargar
  useEffect(() => {
    if (recargar) {
      cargarVentas();
      setRecargar(false);
    }
  }, [recargar, cargarVentas]);

  // Manejar recarga manual
  const handleRecargar = () => {
    setRecargar(true);
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
    setSearchTerm("");
  };

  // Calcular estadísticas (basadas en ventas totales, no filtradas)
  const calcularEstadisticas = () => {
    if (ventas.length === 0) {
      return {
        totalVentas: 0,
        beneficioTotal: 0,
        beneficioPromedio: 0,
        comisionesTotales: 0,
        beneficio24h: 0,
      };
    }

    const ahora = new Date();
    const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

    const beneficioTotal = ventas.reduce(
      (acc, venta) => acc + venta.beneficio,
      0
    );
    const comisionesTotales = ventas.reduce(
      (acc, venta) => acc + (venta.comision || 0),
      0
    );
    const beneficio24h = ventas
      .filter((venta) => new Date(venta.fechaVenta) >= hace24h)
      .reduce((acc, venta) => acc + venta.beneficio, 0);

    return {
      totalVentas: ventas.length,
      beneficioTotal,
      beneficioPromedio: beneficioTotal / ventas.length,
      comisionesTotales,
      beneficio24h,
    };
  };

  const estadisticas = calcularEstadisticas();

  return (
    <>
      <main className="container mx-auto p-4">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold title-custom-foreground">
              Ventas
            </h1>
            <p className="text-sm text-custom-foreground/70 mt-1">
              Gestiona y visualiza todas tus ventas realizadas
            </p>
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {/* Caja de búsqueda */}
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Buscar por símbolo o exchange..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 pl-10 rounded-lg border border-card-border bg-surface text-custom-foreground focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)] transition-shadow"
              />
              <IconoBuscar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-custom-foreground/50 w-4 h-4" />
              {searchTerm && (
                <button
                  onClick={limpiarBusqueda}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-custom-foreground/50 hover:text-custom-foreground/80"
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>

            <Boton
              texto={
                <div className="flex items-center space-x-2">
                  <IconoRefrescar />
                  <span>Recargar</span>
                </div>
              }
              onClick={handleRecargar}
            />
          </div>
        </div>

        {/* Panel de estadísticas (igual que antes) */}
        {ventas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-surface rounded-lg p-4 border border-card-border">
              <div className="text-sm text-custom-foreground/70 mb-1">
                Total Ventas
              </div>
              <div className="text-2xl font-bold text-custom-foreground">
                {estadisticas.totalVentas}
              </div>
            </div>

            <div className="bg-surface rounded-lg p-4 border border-card-border">
              <div className="text-sm text-custom-foreground/70 mb-1">
                Beneficio Total
              </div>
              <div
                className={`text-2xl font-bold ${
                  estadisticas.beneficioTotal >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                ${estadisticas.beneficioTotal.toFixed(2)}
              </div>
            </div>
            <div className="bg-surface rounded-lg p-4 border border-card-border">
              <div className="text-sm text-custom-foreground/70 mb-1">
                Beneficio 24h
              </div>
              <div
                className={`text-2xl font-bold ${
                  estadisticas.beneficio24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                ${estadisticas.beneficio24h.toFixed(2)}
              </div>
            </div>

            <div className="bg-surface rounded-lg p-4 border border-card-border">
              <div className="text-sm text-custom-foreground/70 mb-1">
                Beneficio Promedio
              </div>
              <div
                className={`text-2xl font-bold ${
                  estadisticas.beneficioPromedio >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                ${estadisticas.beneficioPromedio.toFixed(2)}
              </div>
            </div>

            <div className="bg-surface rounded-lg p-4 border border-card-border">
              <div className="text-sm text-custom-foreground/70 mb-1">
                Comisiones Totales
              </div>
              <div className="text-2xl font-bold text-amber-500">
                ${estadisticas.comisionesTotales.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        {/* Estado de carga */}
        {cargando && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--colorTerciario)] mb-4"></div>
            <p className="text-custom-foreground">Cargando ventas...</p>
          </div>
        )}

        {/* Estado de error */}
        {!cargando && error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-2">⚠️ Error</div>
            <p className="text-custom-foreground mb-4">{error}</p>
            <Boton
              texto={
                <div className="flex items-center space-x-2">
                  <IconoRefrescar />
                  <span>Reintentar</span>
                </div>
              }
              onClick={handleRecargar}
            />
          </div>
        )}

        {/* Sin ventas */}
        {!cargando && !error && userId && ventas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-custom-foreground/50 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-custom-foreground mb-2">
              No hay ventas registradas
            </h3>
            <p className="text-custom-foreground/70 mb-6">
              Aún no has realizado ninguna venta. Comienza a vender tus activos
              para verlas aquí.
            </p>
            <Boton
              texto={
                <div className="flex items-center space-x-2">
                  <IconoDolar />
                  <span>Ir a compras</span>
                </div>
              }
              onClick={() => navegador.push("/compras")}
            />
          </div>
        )}

        {/* Mostrar tabla de ventas (filtradas) */}
        {!cargando && !error && userId && ventas.length > 0 && (
          <>
            <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
              <div className="text-sm text-custom-foreground/70">
                {searchTerm ? (
                  <>
                    Mostrando {filteredVentas.length} de {ventas.length} venta
                    {ventas.length !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>Mostrando {ventas.length} venta{ventas.length !== 1 ? "s" : ""}</>
                )}
              </div>

              <div className="text-sm text-custom-foreground/70">
                Última actualización:{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {filteredVentas.length === 0 ? (
              <div className="text-center py-8 bg-surface/50 rounded-lg border border-card-border">
                <p className="text-custom-foreground/70">
                  No se encontraron ventas para ${searchTerm}
                </p>
                <button
                  onClick={limpiarBusqueda}
                  className="mt-2 text-[var(--colorTerciario)] hover:underline"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <TablaVentas ventas={filteredVentas} />
            )}

            {/* Resumen final (con estadísticas totales) */}
            <div className="mt-6 pt-4 border-t border-card-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-custom-foreground/70">
                  Los datos se actualizan en tiempo real
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-custom-foreground/70 mr-2">
                      Beneficio neto:
                    </span>
                    <span
                      className={`font-semibold ${
                        estadisticas.beneficioTotal >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      $
                      {(
                        estadisticas.beneficioTotal -
                        estadisticas.comisionesTotales
                      ).toFixed(2)}
                    </span>
                  </div>

                  <Boton
                    texto={
                      <div className="flex items-center space-x-2">
                        <IconoRefrescar />
                        <span>Sincronizar</span>
                      </div>
                    }
                    onClick={handleRecargar}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notas o información adicional */}
        <div className="mt-6 text-sm text-custom-foreground/60">
          <p className="mb-1">
            💡 <strong>Nota:</strong> Las ventas mostradas incluyen todas las
            operaciones de venta realizadas en tu cuenta.
          </p>
          <p>
            📊 Los cálculos de beneficio incluyen comisiones y tasas aplicadas
            por el exchange.
          </p>
        </div>
      </main>
    </>
  );
}