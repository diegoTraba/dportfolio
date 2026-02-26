"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hooks/useUserId";
import Boton from "@/components/controles/Boton";
import TablaVentas from "@/components/controles/tablas/TablaVentas";
import FiltroOperaciones from "@/components/controles/FiltrosOperaciones";
import Card from "@/components/controles/Card"; // Importamos el componente Card
import { Venta } from "@/interfaces/comun.types";
import {
  IconoRefrescar,
  IconoDolar,
  IconoBuscar,
} from "@/components/controles/Iconos";
import { SIMBOLOS_SOPORTADOS } from "@/lib/constantes";

export default function Ventas() {
  const userId = useUserId();
  const navegador = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recargar, setRecargar] = useState<boolean>(false);

  // Estados para los filtros
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [simboloSeleccionado, setSimboloSeleccionado] = useState<string>("");

  // Filtrar ventas según los filtros seleccionados
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((venta) => {
      // Filtro por fecha (fechaVenta)
      if (fechaInicio) {
        const fechaDesde = fechaInicio.toISOString().split("T")[0];
        if (venta.fechaVenta < fechaDesde) return false;
      }
      if (fechaFin) {
        const fechaHasta = fechaFin.toISOString().split("T")[0];
        if (venta.fechaVenta > fechaHasta) return false;
      }
      // Filtro por símbolo
      if (simboloSeleccionado && venta.simbolo !== simboloSeleccionado)
        return false;
      return true;
    });
  }, [ventas, fechaInicio, fechaFin, simboloSeleccionado]);

  // Función para limpiar todos los filtros
  const handleLimpiarFiltros = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setSimboloSeleccionado("");
  };

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

  // Calcular estadísticas (basadas en ventas totales, no filtradas)
  const calcularEstadisticas = (ventasBase: Venta[]) => {
    if (ventasBase.length === 0) {
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

    const beneficioTotal = ventasBase.reduce(
      (acc, venta) => acc + venta.beneficio,
      0
    );
    const comisionesTotales = ventasBase.reduce(
      (acc, venta) => acc + (venta.comision || 0),
      0
    );
    const beneficio24h = ventasBase
      .filter((venta) => new Date(venta.fechaVenta) >= hace24h)
      .reduce((acc, venta) => acc + venta.beneficio, 0);

    return {
      totalVentas: ventasBase.length,
      beneficioTotal,
      beneficioPromedio: beneficioTotal / ventasBase.length,
      comisionesTotales,
      beneficio24h,
    };
  };

  const estadisticasTotales = calcularEstadisticas(ventas);
  const estadisticasFiltradas = calcularEstadisticas(ventasFiltradas);

  // Determinar si hay filtros activos
  const mostrarFiltros = fechaInicio || fechaFin || simboloSeleccionado;

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

        {/* Panel de estadísticas usando el componente Card */}
        {ventas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card
              titulo="Total Ventas"
              contenido={{
                texto: estadisticasTotales.totalVentas
              }}
            />
            <Card
              titulo="Beneficio Total"
              contenido={{
                texto: `$${estadisticasTotales.beneficioTotal.toFixed(2)}`,
                color: estadisticasTotales.beneficioTotal >= 0 ? '#10b981' : '#ef4444'
              }}
            />
            <Card
              titulo="Beneficio 24h"
              contenido={{
                texto: `$${estadisticasTotales.beneficio24h.toFixed(2)}`,
                color: estadisticasTotales.beneficio24h >= 0 ? '#10b981' : '#ef4444'
              }}
            />
            <Card
              titulo="Beneficio Promedio"
              contenido={{
                texto: `$${estadisticasTotales.beneficioPromedio.toFixed(2)}`,
                color: estadisticasTotales.beneficioPromedio >= 0 ? '#10b981' : '#ef4444'
              }}
            />
            <Card
              titulo="Comisiones Totales"
              contenido={{
                texto: `$${estadisticasTotales.comisionesTotales.toFixed(2)}`,
                color: '#f59e0b'
              }}
            />
          </div>
        )}

        {/* Componente de filtros reutilizable */}
        {ventas.length > 0 && (
          <FiltroOperaciones
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            setFechaInicio={setFechaInicio}
            setFechaFin={setFechaFin}
            simboloSeleccionado={simboloSeleccionado}
            setSimboloSeleccionado={setSimboloSeleccionado}
            handleLimpiarFiltros={handleLimpiarFiltros}
            totalItems={ventas.length}
            itemsFiltrados={ventasFiltradas.length}
            mostrarFiltros={true}
            labelFechaInicio="Fecha de venta desde"
            labelFechaFin="Fecha de venta hasta"
          />
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
                Última actualización:{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {ventasFiltradas.length === 0 ? (
              <div className="text-center py-8 bg-surface/50 rounded-lg border border-card-border">
                <p className="text-custom-foreground/70">
                  No se encontraron ventas con los filtros seleccionados.
                </p>
                <button
                  onClick={handleLimpiarFiltros}
                  className="mt-2 text-[var(--colorTerciario)] hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <TablaVentas ventas={ventasFiltradas} />
            )}

            {/* Resumen final (con estadísticas de las ventas filtradas) */}
            <div className="mt-6 pt-4 border-t border-card-border">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-custom-foreground/70">
                  Los datos se actualizan en tiempo real
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="text-custom-foreground/70 mr-2">
                      Beneficio neto (filtrado):
                    </span>
                    <span
                      className={`font-semibold ${
                        estadisticasFiltradas.beneficioTotal >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      $
                      {(
                        estadisticasFiltradas.beneficioTotal -
                        estadisticasFiltradas.comisionesTotales
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
