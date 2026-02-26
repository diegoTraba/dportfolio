"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hooks/useUserId";
import TablaCompras from "@/components/controles/tablas/TablaCompras";
import FiltroFecha from "@/components/controles/FiltroFecha";
import FiltrosOperaciones from "@/components/controles/FiltrosOperaciones";
import { IconoRefrescar, IconoMas } from "@/components/controles/Iconos";
import Boton from "@/components/controles/Boton";
import { SIMBOLOS_SOPORTADOS } from "@/lib/constantes";
//interfaces
import { Compra, PrecioActual } from "@/interfaces/comun.types";

// Interfaz para la respuesta del endpoint cargarcompras
interface CargarComprasResponse {
  success: boolean;
  data: Compra[];
}

export default function Compras() {
  const userId = useUserId();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [comprasFiltradas, setComprasFiltradas] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [simboloSeleccionado, setSimboloSeleccionado] = useState<string>("");
  const [preciosActuales, setPreciosActuales] = useState<{
    [key: string]: number;
  }>({});
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const navegador = useRouter();

  const simbolosDisponibles: string[] = [...SIMBOLOS_SOPORTADOS];

  // Función para obtener TODOS los precios actuales de las criptomonedas
  const obtenerTodosPreciosActuales = useCallback(async () => {
    try {
      setLoadingPrecios(true);
      const response = await fetch(
        `${BACKEND_URL}/api/usuario/obtenerTodosPreciosCriptomonedas`
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Error al obtener precios actuales");
      }

      // Transformar el array de precios a un objeto { simbolo: precio }
      const preciosMap: { [key: string]: number } = {};
      if (Array.isArray(data.data)) {
        data.data.forEach((precio: PrecioActual) => {
          preciosMap[precio.simbolo] = precio.precio;
        });
      }

      setPreciosActuales(preciosMap);
      return preciosMap;
    } catch (err) {
      console.error("Error obteniendo precios actuales:", err);
      return {};
    } finally {
      setLoadingPrecios(false);
    }
  }, [BACKEND_URL]);

  // Función para obtener compras desde el backend (BASE DE DATOS)
  const fetchCompras = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = `${BACKEND_URL}/api/usuario/${userId}/cargarcompras?noVendida=true`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${errorText || response.statusText}`
        );
      }

      const data = await response.json();

      // Validar que la respuesta contiene las compras
      let comprasArray: Compra[] = [];
      if (data.success && Array.isArray(data.data)) {
        comprasArray = data.data as Compra[];
      } else if (Array.isArray(data)) {
        comprasArray = data as Compra[];
      } else {
        throw new Error("Formato de respuesta inválido");
      }

      setCompras(comprasArray);
      setComprasFiltradas(comprasArray); // inicialmente todas

      // Obtener precios actuales para calcular el cambio
      obtenerTodosPreciosActuales();
    } catch (err) {
      console.error("Error fetching compras:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar las compras"
      );
    } finally {
      setLoading(false);
    }
  }, [userId, BACKEND_URL, obtenerTodosPreciosActuales]);

  // Cargar compras iniciales cuando userId esté disponible
  useEffect(() => {
    if (userId) {
      fetchCompras();
    } else {
      setLoading(false);
    }
  }, [userId, fetchCompras]);

  // Efecto para filtrar localmente cuando cambian los filtros o las compras
  useEffect(() => {
    const timer = setTimeout(() => {
      let filtradas = compras;

      if (fechaInicio) {
        const fechaDesde = fechaInicio.toISOString().split("T")[0];
        filtradas = filtradas.filter((c) => c.fechaCompra >= fechaDesde);
      }

      if (fechaFin) {
        const fechaHasta = fechaFin.toISOString().split("T")[0];
        filtradas = filtradas.filter((c) => c.fechaCompra <= fechaHasta);
      }

      if (simboloSeleccionado) {
        filtradas = filtradas.filter((c) => c.simbolo === simboloSeleccionado);
      }

      setComprasFiltradas(filtradas);
    }, 300);

    return () => clearTimeout(timer);
  }, [fechaInicio, fechaFin, simboloSeleccionado, compras]);

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setSimboloSeleccionado("");
  };

  // Función para crear nueva compra
  const handleNuevaCompra = () => {
    navegador.push("/portfolio/compras/nueva-compra");
  };

  // Calcular estadísticas de filtrado
  const mostrarFiltros = fechaInicio || fechaFin || simboloSeleccionado;
  const totalFiltradas = comprasFiltradas.length;
  const porcentajeFiltrado =
    compras.length > 0
      ? Math.round((totalFiltradas / compras.length) * 100)
      : 0;

  return (
    <>
      <main className="container mx-auto p-4">
        {/* Encabezado con título y botón alineados */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl title-custom-foreground">Mis Operaciones</h1>
          <Boton
            texto={
              <div className="flex items-center space-x-2">
                <IconoMas />
                <span>Compra</span>
              </div>
            }
            onClick={handleNuevaCompra}
          />
        </div>

        {/* Filtros */}
        <FiltrosOperaciones
        fechaInicio={fechaInicio}
        setFechaInicio={setFechaInicio}
        fechaFin={fechaFin}
        setFechaFin={setFechaFin}
        simboloSeleccionado={simboloSeleccionado}
        setSimboloSeleccionado={setSimboloSeleccionado}
        handleLimpiarFiltros={handleLimpiarFiltros}
        totalItems={compras.length}
        itemsFiltrados={totalFiltradas}
        mostrarFiltros={true}
        labelFechaInicio="Fecha de compra desde"
        labelFechaFin="Fecha de compra hasta"
      />

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
            <div>
              <p className="text-lg font-medium">Cargando operaciones...</p>
              <p className="text-sm text-gray-500">
                Obteniendo todas las operaciones
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-start">
              <div>
                <strong className="font-bold">Error:</strong>
                <span className="ml-2">{error}</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-4 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {!loading && !error && comprasFiltradas.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-xl font-medium mb-2">
                No se encontraron operaciones
              </p>
              <p className="mb-4">
                {mostrarFiltros
                  ? "No hay operaciones que coincidan con los filtros seleccionados."
                  : "No hay operaciones registradas en tu cuenta."}
              </p>
            </div>
            {mostrarFiltros && (
              <button
                onClick={handleLimpiarFiltros}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ver todas las operaciones
              </button>
            )}
          </div>
        )}

        {!loading && !error && comprasFiltradas.length > 0 && (
          <>
            <div className="mb-4">
              <TablaCompras
                compras={comprasFiltradas}
                preciosActuales={preciosActuales}
                userId={userId}
              />

              {/* Leyenda de operaciones del bot */}
              <div className="mt-3 flex items-center gap-2 text-sm text-custom-foreground">
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{
                    backgroundColor: "rgba(var(--colorTerciario-rgb), 0.2)",
                  }}
                ></div>
                <span>Operaciones realizadas por el bot de señales</span>
              </div>
            </div>

            {/* Información del pie */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Mostrando {comprasFiltradas.length} operaciones
                {mostrarFiltros && ` (filtradas de ${compras.length} totales)`}
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
