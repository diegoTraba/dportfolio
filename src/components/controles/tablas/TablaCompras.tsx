import DataTable, {
  TableColumn,
  TableStyles,
} from "react-data-table-component";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Compra } from "@/interfaces/comun.types";
import {
  IconoDolar,
  IconoEtiqueta,
  IconoTrendingUp,
  IconoTrendingDown,
  IconoInfo,
  IconoCerrar,
} from "@/components/controles/Iconos";
import "./TablaCompras.css";

interface TablaComprasProps {
  compras: Compra[];
  preciosActuales?: { [key: string]: number };
  onVender?: (compra: Compra) => void;
  onMarcarVendido?: (compra: Compra) => void;
  userId?: string; // Nuevo: ID del usuario para el endpoint
  onVentaExitosa?: () => void; // Callback cuando una venta se completa
}

// Función auxiliar para formatear fechas de manera segura
const formatDateSafe = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    // Formatear a dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formateando fecha:", dateString, error);
    return "Fecha inválida";
  }
};

// Función para calcular el cambio
const calcularCambio = (compra: Compra, precioActual?: number) => {
  if (!precioActual || compra.vendida) return null;

  const cantidad = compra.cantidadRestante || compra.cantidad;
  const totalActual = precioActual * cantidad;
  const cambio = totalActual - compra.total;
  const porcentaje = (cambio / compra.total) * 100;

  return {
    valor: cambio,
    porcentaje: porcentaje,
    totalActual: totalActual,
  };
};

// Componente para mostrar el cambio
const CambioDisplay = ({
  cambio,
}: {
  cambio: { valor: number; porcentaje: number } | null;
}) => {
  if (cambio === null) {
    return <div className="text-gray-500 text-sm">-</div>;
  }

  const isPositive = cambio.valor >= 0;

  return (
    <div
      className={`flex flex-col items-end ${isPositive ? "text-green-500" : "text-red-500"}`}
    >
      <div className="flex items-center gap-1">
        {isPositive ? (
          <IconoTrendingUp className="w-3 h-3" />
        ) : (
          <IconoTrendingDown className="w-3 h-3" />
        )}
        <span className="font-semibold">${cambio.valor.toFixed(2)}</span>
      </div>
      <div
        className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}
      >
        ({cambio.porcentaje >= 0 ? "+" : ""}
        {cambio.porcentaje.toFixed(2)}%)
      </div>
    </div>
  );
};

// Componente Modal para confirmar venta - VERSIÓN SIN USEEFFECT
interface ModalVentaProps {
  isOpen: boolean;
  onClose: () => void;
  compra: Compra | null;
  precioActual: number;
  onConfirmar: (data: {
    cantidad: number;
    tipoOrden: "MARKET" | "LIMIT";
    precioLimite?: number;
    quoteQuantity?: number;
  }) => void;
  isLoading?: boolean;
}

const ModalVenta: React.FC<ModalVentaProps> = ({
  isOpen,
  onClose,
  compra,
  precioActual,
  onConfirmar,
  isLoading = false,
}) => {
  // Inicializar con valores por defecto
  const [cantidad, setCantidad] = useState("");
  const [tipoOrden, setTipoOrden] = useState<"MARKET" | "LIMIT">("MARKET");
  const [precioLimite, setPrecioLimite] = useState("");
  const [quoteQuantity, setQuoteQuantity] = useState("");

  // Resetear estado cuando el modal se cierra
  const handleClose = () => {
    setCantidad("");
    setTipoOrden("MARKET");
    setPrecioLimite("");
    setQuoteQuantity("");
    onClose();
  };

  // Obtener cantidad disponible (se recalcula en cada render)
  const cantidadDisponible = compra
    ? compra.cantidadRestante || compra.cantidad
    : 0;

  // Cuando el componente se monta/actualiza con una nueva compra
  // Inicializamos la cantidad si está vacía
  if (compra && isOpen && cantidad === "") {
    // Esto se ejecuta solo durante el render, no es un efecto
    // Es seguro porque es síncrono durante el renderizado
    setCantidad(cantidadDisponible.toString());
  }

  if (!isOpen || !compra) return null;

  const valorVentaEstimado = parseFloat(cantidad || "0") * precioActual;
  const esVentaParcial = parseFloat(cantidad || "0") < cantidadDisponible;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cantidadNum = parseFloat(cantidad);
    const precioLimiteNum = precioLimite ? parseFloat(precioLimite) : undefined;
    const quoteQuantityNum = quoteQuantity
      ? parseFloat(quoteQuantity)
      : undefined;

    if (cantidadNum > cantidadDisponible) {
      alert("No puedes vender más de lo disponible");
      return;
    }

    if (cantidadNum <= 0) {
      alert("La cantidad debe ser mayor que 0");
      return;
    }

    onConfirmar({
      cantidad: cantidadNum,
      tipoOrden,
      precioLimite: precioLimiteNum,
      quoteQuantity: quoteQuantityNum,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--card-bg)] rounded-lg shadow-xl w-full max-w-md mx-4 border border-[var(--card-border)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Vender {compra.simbolo}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-[var(--surface)] transition-colors"
          >
            <IconoCerrar className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Información de la compra */}
          <div className="p-3 bg-[var(--surface)] rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Disponible:
              </span>
              <span className="font-medium">
                {cantidadDisponible.toFixed(4)}{" "}
                {compra.simbolo.replace("USDC", "").replace("USDT", "")}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Precio compra:
              </span>
              <span className="font-medium">${compra.precio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Precio actual:
              </span>
              <span className="font-medium">${precioActual.toFixed(2)}</span>
            </div>
          </div>

          {/* Cantidad a vender */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
              Cantidad a vender
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="any"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="flex-1 p-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)]"
                placeholder="Cantidad"
                min="0"
                max={cantidadDisponible}
                required
              />
              <button
                type="button"
                onClick={() => setCantidad(cantidadDisponible.toString())}
                className="px-3 py-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors"
              >
                Máx
              </button>
            </div>
            <div className="mt-1 text-xs text-[var(--foreground-secondary)]">
              {esVentaParcial ? "Venta parcial" : "Venta total"}
            </div>
          </div>

          {/* Valor estimado */}
          <div className="p-3 bg-[var(--surface)] rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Valor estimado:
              </span>
              <span className="font-medium">
                ${valorVentaEstimado.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Tipo de orden */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
              Tipo de orden
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoOrden("MARKET")}
                className={`flex-1 py-2 px-3 rounded-lg transition-colors ${tipoOrden === "MARKET" ? "bg-blue-500 text-white" : "bg-[var(--surface)] text-[var(--foreground)]"}`}
              >
                Mercado
              </button>
              <button
                type="button"
                onClick={() => setTipoOrden("LIMIT")}
                className={`flex-1 py-2 px-3 rounded-lg transition-colors ${tipoOrden === "LIMIT" ? "bg-blue-500 text-white" : "bg-[var(--surface)] text-[var(--foreground)]"}`}
              >
                Límite
              </button>
            </div>
          </div>

          {/* Precio límite (solo para órdenes LIMIT) */}
          {tipoOrden === "LIMIT" && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                Precio límite
              </label>
              <input
                type="number"
                step="any"
                value={precioLimite}
                onChange={(e) => setPrecioLimite(e.target.value)}
                className="w-full p-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)]"
                placeholder="Ej: 1.25"
                required={tipoOrden === "LIMIT"}
              />
            </div>
          )}

          {/* Quote Quantity (opcional) */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
              Monto fijo a obtener (opcional)
            </label>
            <input
              type="number"
              step="any"
              value={quoteQuantity}
              onChange={(e) => setQuoteQuantity(e.target.value)}
              className="w-full p-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)]"
              placeholder="Ej: 1000 (USDC/USDT)"
            />
            <div className="mt-1 text-xs text-[var(--foreground-secondary)] flex items-center gap-1">
              <IconoInfo className="w-3 h-3" />
              Dejar vacío para vender por cantidad del activo
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 rounded-lg border border-[var(--card-border)] hover:bg-[var(--surface)] transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Confirmar Venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente separado para las tarjetas móviles
const MobileCards = ({
  compras,
  preciosActuales = {},
  onVender,
  onMarcarVendido,
}: {
  compras: Compra[];
  preciosActuales: { [key: string]: number };
  onVender: (compra: Compra) => void;
  onMarcarVendido: (compra: Compra) => void;
}) => (
  <div className="mobile-cards-container">
    {compras.map((compra, index) => {
      const precioActual = preciosActuales[compra.simbolo];
      const cambio = calcularCambio(compra, precioActual);
      const cantidadDisponible = compra.cantidadRestante || compra.cantidad;

      return (
        <div key={compra.id || index} className="purchase-card">
          <div className="card-row">
            <span className="label">Exchange:</span>
            <span className="value">{compra.exchange}</span>
          </div>
          <div className="card-row">
            <span className="label">Símbolo:</span>
            <span className="value">{compra.simbolo}</span>
          </div>
          <div className="card-row">
            <span className="label">Precio Compra:</span>
            <span className="value">${compra.precio.toFixed(2)}</span>
          </div>
          <div className="card-row">
            <span className="label">Precio Actual:</span>
            <span className="value">
              {precioActual ? `$${precioActual.toFixed(2)}` : "-"}
            </span>
          </div>
          <div className="card-row">
            <span className="label">Cantidad:</span>
            <span className="value">{compra.cantidad.toFixed(4)}</span>
          </div>
          <div className="card-row">
            <span className="label">Total Compra:</span>
            <span className="value">${compra.total?.toFixed(2)}</span>
          </div>
          {cambio && (
            <div className="card-row">
              <span className="label">Total Actual:</span>
              <span className="value">${cambio.totalActual.toFixed(2)}</span>
            </div>
          )}
          <div className="card-row">
            <span className="label">Cambio:</span>
            <div className="value">
              {cambio ? (
                <div
                  className={`flex items-center gap-1 ${cambio.valor >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  {cambio.valor >= 0 ? (
                    <IconoTrendingUp className="w-4 h-4" />
                  ) : (
                    <IconoTrendingDown className="w-4 h-4" />
                  )}
                  <span>${cambio.valor.toFixed(2)}</span>
                  <span className="text-xs">
                    ({cambio.porcentaje >= 0 ? "+" : ""}
                    {cambio.porcentaje.toFixed(2)}%)
                  </span>
                </div>
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          </div>
          <div className="card-row">
            <span className="label">Comisión:</span>
            <span className="value">
              {compra.comision?.toFixed(2) + " " || "0.00 "}{" "}
              {compra.comisionMoneda?.toString() || ""}
            </span>
          </div>
          <div className="card-row">
            <span className="label">Fecha:</span>
            <span className="value">{formatDateSafe(compra.fechaCompra)}</span>
          </div>
          <div className="card-row">
            <span className="label">Estado:</span>
            <span className="value">
              {compra.vendida ? (
                <span className="text-green-500 font-medium">Vendida</span>
              ) : cantidadDisponible < compra.cantidad ? (
                <span className="text-blue-500 font-medium">
                  Parcialmente vendida
                </span>
              ) : (
                <span className="text-gray-500">Disponible</span>
              )}
            </span>
          </div>
          <div className="card-row">
            <span className="label">Acciones:</span>
            <div className="value flex items-center gap-2">
              <button
                onClick={() => onVender(compra)}
                className={`p-1.5 rounded-lg transition-colors ${compra.vendida ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"}`}
                title="Vender"
                disabled={compra.vendida}
              >
                <IconoDolar className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMarcarVendido(compra)}
                className={`p-1.5 rounded-lg transition-colors ${compra.vendida ? "bg-green-500/20 text-green-500" : "bg-green-500/10 hover:bg-green-500/20 text-green-500"}`}
                title={compra.vendida ? "Ya vendida" : "Marcar como vendida"}
              >
                <IconoEtiqueta className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const TablaCompras = ({
  compras,
  preciosActuales = {},
  onVender,
  onMarcarVendido,
  userId,
  onVentaExitosa,
}: TablaComprasProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para el modal de venta
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(
    null
  );
  const [isLoadingVenta, setIsLoadingVenta] = useState(false);

  // Calcular las filas visibles en la página actual
  const getVisibleRows = useCallback(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return compras.slice(startIndex, endIndex);
  }, [compras, currentPage, rowsPerPage]);

  // Calcular selectAll solo para las filas visibles
  const visibleRows = getVisibleRows();
  const allVisibleSelected =
    visibleRows.length > 0 &&
    visibleRows.every((row) => selectedRows.includes(row.id));

  // Handler para abrir modal de venta
  const handleAbrirModalVenta = useCallback(
    (compra: Compra) => {
      if (compra.vendida) {
        console.log("Esta compra ya está vendida");
        return;
      }

      if (!userId) {
        console.error("No hay userId disponible para realizar la venta");
        alert(
          "Error: No se pudo identificar al usuario. Por favor, inicia sesión nuevamente."
        );
        return;
      }

      setCompraSeleccionada(compra);
      setModalVentaOpen(true);
    },
    [userId]
  );

  // Define la interfaz para el payload de venta
  interface VentaPayload {
    compraId: number;
    symbol: string;
    type: "MARKET" | "LIMIT";
    quantity?: number;
    quoteQuantity?: number;
    price?: number;
  }

  // Handler para confirmar venta
  const handleConfirmarVenta = useCallback(async (data: {
    cantidad: number;
    tipoOrden: "MARKET" | "LIMIT";
    precioLimite?: number;
    quoteQuantity?: number;
  }) => {
    if (!compraSeleccionada || !userId) return;
  
    setIsLoadingVenta(true);
    try {
      // Crear payload con tipo específico
      const payload: VentaPayload = {
        compraId: compraSeleccionada.id,
        symbol: compraSeleccionada.simbolo,
        type: data.tipoOrden,
      };
  
      // Usar quoteQuantity si se especificó, de lo contrario usar quantity
      if (data.quoteQuantity) {
        payload.quoteQuantity = data.quoteQuantity;
      } else {
        payload.quantity = data.cantidad;
      }
  
      if (data.tipoOrden === "LIMIT" && data.precioLimite) {
        payload.price = data.precioLimite;
      }
  
      console.log("Enviando orden de venta:", payload);
  
      const response = await fetch(`/api/binance/user/${userId}/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      const result = await response.json();
  
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al ejecutar la venta");
      }
  
      console.log("✅ Venta ejecutada exitosamente:", result);
      
      // Cerrar modal
      setModalVentaOpen(false);
      setCompraSeleccionada(null);
      
      // Mostrar mensaje de éxito
      alert(`Venta ejecutada exitosamente. Orden ID: ${result.localId || result.order?.orderId}`);
      
      // Llamar al callback si existe
      if (onVentaExitosa) {
        onVentaExitosa();
      }
      
    } catch (error) {
      console.error("❌ Error en la venta:", error);
      alert(`Error al ejecutar la venta: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsLoadingVenta(false);
    }
  }, [compraSeleccionada, userId, onVentaExitosa]);

  // Handler para el botón de vender (compatibilidad con prop onVender)
  const handleVender = useCallback(
    (compra: Compra) => {
      if (onVender) {
        onVender(compra);
      } else {
        handleAbrirModalVenta(compra);
      }
    },
    [onVender, handleAbrirModalVenta]
  );

  const handleMarcarVendido = useCallback(
    (compra: Compra) => {
      if (onMarcarVendido) {
        onMarcarVendido(compra);
      } else {
        console.log("Marcar como vendida:", compra);
      }
    },
    [onMarcarVendido]
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Efecto para forzar la alineación de las cabeceras
  useEffect(() => {
    if (!isMobile) {
      const forceHeaderAlignment = () => {
        // Esperar a que la tabla se renderice completamente
        setTimeout(() => {
          // Seleccionar todos los headers de columna
          const columnHeaders = document.querySelectorAll(
            'div[role="columnheader"]'
          );

          columnHeaders.forEach((header, index) => {
            const headerElement = header as HTMLElement;

            // Asegurar que tenga display flex
            headerElement.style.display = "flex";
            headerElement.style.alignItems = "center";

            // Ajustar las posiciones para incluir la nueva columna Cambio
            // 1: Selección, 2: Exchange, 3: Símbolo, 4: Precio, 5: Cantidad,
            // 6: Total, 7: Cambio, 8: Comisión, 9: Fecha, 10: Acciones

            // Columnas centradas (1, 2, 3, 10)
            if ([1, 2, 3, 10].includes(index + 1)) {
              headerElement.style.justifyContent = "center";
              headerElement.style.textAlign = "center";
            }
            // Columnas alineadas a la derecha (4, 5, 6, 7, 8, 9)
            else if ([4, 5, 6, 7, 8, 9].includes(index + 1)) {
              headerElement.style.justifyContent = "flex-end";
              headerElement.style.textAlign = "right";
            }
          });

          // También aplicar a las celdas de contenido
          const gridCells = document.querySelectorAll('div[role="gridcell"]');

          gridCells.forEach((cell, index) => {
            const cellElement = cell as HTMLElement;

            // Calcular la posición de la columna dentro de la fila
            const cellIndex =
              Array.from(cell.parentElement?.children || []).indexOf(cell) + 1;

            // Asegurar que tenga display flex
            cellElement.style.display = "flex";
            cellElement.style.alignItems = "center";

            // Columnas centradas (1, 2, 3, 10)
            if ([1, 2, 3, 10].includes(cellIndex)) {
              cellElement.style.justifyContent = "center";
              cellElement.style.textAlign = "center";
            }
            // Columnas alineadas a la derecha (4, 5, 6, 7, 8, 9)
            else if ([4, 5, 6, 7, 8, 9].includes(cellIndex)) {
              cellElement.style.justifyContent = "flex-end";
              cellElement.style.textAlign = "right";
            }
          });
        }, 100); // Pequeño delay para asegurar que la tabla se haya renderizado
      };

      // Ejecutar al montar y cuando cambien los datos o la página
      forceHeaderAlignment();

      // También ejecutar cuando cambie el tamaño de la ventana
      window.addEventListener("resize", forceHeaderAlignment);

      return () => {
        window.removeEventListener("resize", forceHeaderAlignment);
      };
    }
  }, [isMobile, compras, currentPage, rowsPerPage]);

  // Manejar selección individual
  const handleRowSelect = useCallback((id: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rowId) => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // Manejar selección de todas las filas VISIBLES
  const handleSelectAllVisible = useCallback(() => {
    const visibleRowIds = visibleRows.map((row) => row.id);

    if (allVisibleSelected) {
      // Deseleccionar todas las filas visibles
      setSelectedRows((prev) =>
        prev.filter((id) => !visibleRowIds.includes(id))
      );
    } else {
      // Seleccionar todas las filas visibles
      setSelectedRows((prev) => {
        const newSelection = [...prev];
        visibleRowIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  }, [allVisibleSelected, visibleRows]);

  // Manejar cambio de página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Manejar cambio de filas por página
  const handlePerRowsChange = useCallback(
    (newPerPage: number, page: number) => {
      setRowsPerPage(newPerPage);
      setCurrentPage(page);
    },
    []
  );

  // Estilos mínimos para la tabla
  const customStyles: TableStyles = {
    table: {
      style: {
        width: "100%",
      },
    },
    headRow: {
      style: {
        backgroundColor: "var(--header-bg)",
        color: "var(--foreground)",
        fontSize: "14px",
        fontWeight: "bold",
        minHeight: "52px",
        borderBottom: "2px solid var(--header-border)",
      },
    },
    headCells: {
      style: {
        backgroundColor: "var(--header-bg)",
        color: "var(--foreground)",
        fontSize: "14px",
        fontWeight: "bold",
        paddingLeft: "12px",
        paddingRight: "12px",
      },
    },
    cells: {
      style: {
        backgroundColor: "var(--card-bg)",
        color: "var(--foreground)",
        fontSize: "14px",
        paddingLeft: "12px",
        paddingRight: "12px",
      },
    },
    rows: {
      style: {
        backgroundColor: "var(--card-bg)",
        color: "var(--foreground)",
        borderBottom: "1px solid var(--card-border)",
        "&:hover": {
          backgroundColor: "var(--surface) !important",
        },
      },
      stripedStyle: {
        backgroundColor: "var(--surface)",
      },
    },
    pagination: {
      style: {
        backgroundColor: "var(--card-bg)",
        color: "var(--foreground)",
        borderTop: "1px solid var(--card-border)",
      },
    },
  };

  const columns: TableColumn<Compra>[] = useMemo(() => {
    const baseColumnProps = {
      style: {
        paddingLeft: "10px",
        paddingRight: "10px",
      },
      headerStyle: {
        paddingLeft: "10px",
        paddingRight: "10px",
      },
    };

    const baseColumns: TableColumn<Compra>[] = [
      {
        name: "Exchange",
        selector: (row: Compra) => row.exchange,
        sortable: true,
        width: "12%",
        ...baseColumnProps,
        style: { minWidth: "110px" },
      },
      {
        name: "Símbolo",
        selector: (row: Compra) => row.simbolo,
        sortable: true,
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
      {
        name: "Precio",
        selector: (row: Compra) => row.precio,
        sortable: true,
        format: (row: Compra) => `$${row.precio.toFixed(2)}`,
        width: "11%",
        ...baseColumnProps,
        style: { minWidth: "105px" },
      },
      {
        name: "Cantidad",
        selector: (row: Compra) => row.cantidad,
        sortable: true,
        format: (row: Compra) => row.cantidad.toFixed(4),
        width: "11%",
        ...baseColumnProps,
        style: { minWidth: "105px" },
      },
      {
        name: "Total",
        selector: (row: Compra) => row.total,
        sortable: true,
        format: (row: Compra) => `$${row.total.toFixed(2)}`,
        width: "11%",
        ...baseColumnProps,
        style: { minWidth: "105px" },
      },
      {
        name: "Cambio",
        cell: (row: Compra) => {
          const precioActual = preciosActuales[row.simbolo];
          const cambio = calcularCambio(row, precioActual);
          return <CambioDisplay cambio={cambio} />;
        },
        sortable: true,
        sortFunction: (rowA: Compra, rowB: Compra) => {
          const precioActualA = preciosActuales[rowA.simbolo];
          const cambioA = calcularCambio(rowA, precioActualA);
          const precioActualB = preciosActuales[rowB.simbolo];
          const cambioB = calcularCambio(rowB, precioActualB);

          return (cambioA?.valor || 0) - (cambioB?.valor || 0);
        },
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
      {
        name: "Comisión",
        selector: (row: Compra) => row.comision || 0,
        sortable: true,
        format: (row: Compra) =>
          `${(row.comision || 0).toFixed(2) + " "} ${row.comisionMoneda || ""}`,
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
      {
        name: "Fecha",
        selector: (row: Compra) => row.fechaCompra,
        sortable: true,
        format: (row: Compra) => formatDateSafe(row.fechaCompra),
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
      {
        name: "Acciones",
        cell: (row: Compra) => (
          <div className="flex items-center justify-center w-full gap-1">
            <button
              onClick={() => handleVender(row)}
              className={`p-1 rounded-lg transition-colors ${row.vendida ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"}`}
              title={row.vendida ? "Ya vendida" : "Vender"}
              disabled={row.vendida}
            >
              <IconoDolar className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleMarcarVendido(row)}
              className={`p-1 rounded-lg transition-colors ${row.vendida ? "bg-green-500/20 text-green-500" : "bg-green-500/10 hover:bg-green-500/20 text-green-500"}`}
              title={row.vendida ? "Ya vendida" : "Marcar como vendida"}
            >
              <IconoEtiqueta className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
        sortable: false,
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
    ];

    // Añadir columna de selección solo si no es móvil
    if (!isMobile) {
      const selectionColumn: TableColumn<Compra> = {
        name: (
          <div className="flex items-center justify-center w-full">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={handleSelectAllVisible}
              className="h-4 w-4 rounded border-gray-300 text-[var(--colorTerciario)] focus:ring-[var(--colorTerciario)]"
            />
          </div>
        ),
        cell: (row: Compra) => (
          <div className="flex items-center justify-center w-full">
            <input
              type="checkbox"
              checked={selectedRows.includes(row.id)}
              onChange={() => handleRowSelect(row.id)}
              className="h-4 w-4 rounded border-gray-300 text-[var(--colorTerciario)] focus:ring-[var(--colorTerciario)]"
            />
          </div>
        ),
        sortable: false,
        width: "4%",
        ...baseColumnProps,
        style: { minWidth: "50px" },
      };

      return [selectionColumn, ...baseColumns];
    }

    return baseColumns;
  }, [
    isMobile,
    allVisibleSelected,
    selectedRows,
    handleSelectAllVisible,
    handleRowSelect,
    handleVender,
    handleMarcarVendido,
    preciosActuales,
  ]);

  // Obtener precio actual para el modal
  const precioActualModal = compraSeleccionada
    ? preciosActuales[compraSeleccionada.simbolo] || 0
    : 0;

  return (
    <>
      <div className="compras-table-container">
        {isMobile ? (
          <MobileCards
            compras={compras}
            preciosActuales={preciosActuales}
            onVender={handleVender}
            onMarcarVendido={handleMarcarVendido}
          />
        ) : (
          <>
            {/* Mostrar información de selección si hay filas seleccionadas */}
            {selectedRows.length > 0 && (
              <div className="mb-4 p-3 bg-alerta-activa border border-alerta-activa rounded-lg">
                <p className="text-sm text-custom-foreground">
                  {selectedRows.length} fila(s) seleccionada(s)
                </p>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
              <DataTable
                columns={columns}
                data={compras}
                customStyles={customStyles}
                pagination
                paginationPerPage={rowsPerPage}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                highlightOnHover
                striped
                noDataComponent={
                  <div className="text-center py-8 text-custom-foreground opacity-70">
                    No se encontraron operaciones
                  </div>
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Modal de venta */}
      <ModalVenta
        isOpen={modalVentaOpen}
        onClose={() => {
          setModalVentaOpen(false);
          setCompraSeleccionada(null);
        }}
        compra={compraSeleccionada}
        precioActual={precioActualModal}
        onConfirmar={handleConfirmarVenta}
        isLoading={isLoadingVenta}
      />
    </>
  );
};

export default TablaCompras;
