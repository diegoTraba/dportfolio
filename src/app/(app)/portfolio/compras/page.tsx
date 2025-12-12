"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUserId } from "@/hooks/useUserId";
import TablaCompras from "@/components/controles/tablas/TablaCompras";
import FiltroFecha from "@/components/controles/FiltroFecha";
import { IconoRefrescar } from "@/components/controles/Iconos";

//interfaces
import { ApiResponse, Compra, PrecioActual } from "@/interfaces/comun.types";

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
  const [preciosActuales, setPreciosActuales] = useState<{ [key: string]: number }>({});
  const [loadingPrecios, setLoadingPrecios] = useState(false);

  // Obtener símbolos de la variable de entorno
  // const simbolosDisponibles = process.env.NEXT_PUBLIC_CRIPTOMONEDAS_ALERTAS 
  //   ? process.env.NEXT_PUBLIC_CRIPTOMONEDAS_ALERTAS.split(',').map(s => s.trim()).filter(Boolean)
  //   : [];
  const simbolosDisponibles: string[] = process.env.NEXT_PUBLIC_CRIPTOMONEDAS_ALERTAS ? JSON.parse(process.env.NEXT_PUBLIC_CRIPTOMONEDAS_ALERTAS) : [];

  // Usamos useRef para evitar que el efecto se ejecute en la carga inicial
  const isInitialMount = useRef(true);

  // Función para formatear fecha a ISO string (YYYY-MM-DD)
  const formatDateToISO = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

    // Función para obtener TODOS los precios actuales de las criptomonedas
    const obtenerTodosPreciosActuales = useCallback(async () => {
      try {
        setLoadingPrecios(true);
        const response = await fetch(`${BACKEND_URL}/api/usuario/obtenerTodosPreciosCriptomonedas`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
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
            console.log(precio.simbolo +": "+ precio.precio);
          });
        }
        else{ console.log("data no es un array: "+ data.data);}
        
        setPreciosActuales(preciosMap);
        console.log("Se obtuvieron correctamente los precios actuales: "+ preciosMap);
        return preciosMap;
      } catch (err) {
        console.error("Error obteniendo precios actuales:", err);
        // No lanzamos error aquí para no bloquear la vista de compras
        return {};
      } finally {
        setLoadingPrecios(false);
      }
    }, [BACKEND_URL]);

  // Función para obtener compras desde el backend
  const fetchCompras = useCallback(
    async (fechaDesde?: string, fechaHasta?: string, simbolo?: string) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Construir URL con parámetros de filtro
        let url = `${BACKEND_URL}/api/binance/compras-activas/${userId}?limit=1000`;

        if (fechaDesde) {
          url += `&fechaDesde=${fechaDesde}`;
        }

        if (fechaHasta) {
          url += `&fechaHasta=${fechaHasta}`;
        }

        if (simbolo) {
          url += `&simbolo=${simbolo}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error ${response.status}: ${errorText || response.statusText}`
          );
        }

        const data: ApiResponse = await response.json();

        // Validar que la respuesta fue exitosa
        if (!data.success) {
          throw new Error("La API no devolvió una respuesta exitosa");
        }

        // Validar que compras es un array
        if (!Array.isArray(data.compras)) {
          throw new Error("Formato de trades inválido");
        }

        // Transformar los trades de la API al formato que espera TablaCompras
        const comprasTransformadas: Compra[] = data.compras.map((compra) => ({
          id: compra.id,
          exchange: compra.exchange,
          idOrden: compra.idOrden,
          simbolo: compra.simbolo,
          precio: compra.precio,
          cantidad: compra.cantidad,
          total: compra.total,
          comision: compra.comision,
          fechaCompra: compra.fechaCompra,
          vendida: compra.vendida,
        }));

        // Si no hay filtros de fecha, actualizamos ambas listas
        if (!fechaDesde && !fechaHasta && !simbolo) {
          setCompras(comprasTransformadas);
        }

        // Siempre actualizamos las compras filtradas
        setComprasFiltradas(comprasTransformadas);

        // Obtener precios actuales para calcular el cambio
        // Esto se hará en paralelo y no bloqueará la carga de compras
        obtenerTodosPreciosActuales();
      } catch (err) {
        console.error("Error fetching compras:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar las compras"
        );
      } finally {
        setLoading(false);
      }
    },
    [userId, BACKEND_URL, obtenerTodosPreciosActuales]
  );

  // Cargar compras iniciales cuando userId esté disponible
  useEffect(() => {
    if (userId) {
      fetchCompras();
    } else {
      setLoading(false);
    }
  }, [userId, fetchCompras]); // Se ejecuta cuando userId cambia

  // Aplicar filtros cuando cambian las fechas
  useEffect(() => {
    // Evitar ejecución en el montaje inicial
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Debounce para evitar múltiples llamadas rápidas
    const timer = setTimeout(() => {
      if (fechaInicio || fechaFin || simboloSeleccionado) {
        // Si hay filtros, aplicar filtrado
        const fechaDesde = fechaInicio
          ? formatDateToISO(fechaInicio)
          : undefined;
        const fechaHasta = fechaFin ? formatDateToISO(fechaFin) : undefined;

        fetchCompras(fechaDesde, fechaHasta, simboloSeleccionado || undefined);
      } else {
        // Si no hay filtros, mostrar todas las compras
        fetchCompras();
      }
    }, 300); // 300ms de debounce

    return () => clearTimeout(timer);
  }, [fechaInicio, fechaFin, simboloSeleccionado, fetchCompras]); // Solo dependemos de las fechas

  // Función para limpiar filtros
  const handleLimpiarFiltros = () => {
    setFechaInicio(null);
    setFechaFin(null);
    setSimboloSeleccionado("");
    // Al limpiar filtros, cargamos todas las compras
    fetchCompras();
  };

  // Función para actualizar precios manualmente
  const handleActualizarPrecios = async () => {
    await obtenerTodosPreciosActuales();
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
        <h1 className="text-2xl title-custom-foreground mb-2">
          Mis Operaciones
        </h1>
        {/* <p className="text-gray-600 dark:text-gray-400 mb-6">
          {compras.length > 0
            ? `Total de operaciones: ${compras.length}`
            : "No hay operaciones registradas"}
        </p> */}

        {/* Filtros */}
        <div className="mb-8 p-4 bg-custom-card border border-custom-card rounded-lg">
          <h2 className="text-lg title-custom-foreground mb-4">
            Filtros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FiltroFecha
                label="Fecha de inicio"
                placeholder="Desde"
                value={fechaInicio}
                onChange={setFechaInicio}
                maxDate={fechaFin ? fechaFin : undefined}
              />
            </div>

            <div>
              <FiltroFecha
                label="Fecha de fin"
                placeholder="Hasta"
                value={fechaFin}
                onChange={setFechaFin}
                minDate={fechaInicio || undefined}
                maxDate={new Date()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-custom-foreground">
                Símbolo
              </label>
              <select
                value={simboloSeleccionado}
                onChange={(e) => setSimboloSeleccionado(e.target.value)}
                className="w-full px-4 py-3 bg-custom-surface border border-custom-border rounded-lg text-custom-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los símbolos</option>
                {simbolosDisponibles.map((simbolo) => (
                  <option key={simbolo} value={simbolo}>
                    {simbolo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleLimpiarFiltros}
                className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-custom-surface hover:bg-custom-header rounded-lg transition-colors text-custom-foreground border border-custom-border"
              >
                <IconoRefrescar className="w-4 h-4" />
                Limpiar filtros
              </button>
            </div>
          </div>

          {/* Información de filtrado */}
          {mostrarFiltros && (
            <div className="mt-4 p-3 bg-alerta-activa border border-alerta-activa rounded-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div>
                <p className="text-sm text-custom-foreground">
                    Mostrando operaciones
                    {fechaInicio && fechaFin
                      ? ` del ${fechaInicio.toLocaleDateString("es-ES")} al ${fechaFin.toLocaleDateString("es-ES")}`
                      : fechaInicio
                        ? ` desde el ${fechaInicio.toLocaleDateString("es-ES")}`
                        : fechaFin
                          ? ` hasta el ${fechaFin?.toLocaleDateString("es-ES")}`
                          : ""}
                    {simboloSeleccionado && (
                      <span>
                        {fechaInicio || fechaFin ? " y " : " "}
                        con símbolo: <strong>{simboloSeleccionado}</strong>
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-sm text-custom-foreground">
                  <span className="font-semibold">{totalFiltradas}</span> de{" "}
                  {compras.length} operaciones ({porcentajeFiltrado}%)
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mr-4"></div>
            <div>
              <p className="text-lg font-medium">Cargando operaciones...</p>
              <p className="text-sm text-gray-500">
                {fechaInicio || fechaFin || simboloSeleccionado
                  ? "Aplicando filtros de fecha"
                  : "Obteniendo todas las operaciones"}
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
              <TablaCompras compras={comprasFiltradas} preciosActuales={preciosActuales} />
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
