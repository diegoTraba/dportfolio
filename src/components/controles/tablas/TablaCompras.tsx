import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Compra } from "@/interfaces/comun.types";
import { IconoDolar, IconoEtiqueta, IconoTrendingUp, IconoTrendingDown } from "@/components/controles/Iconos";
import ModalVenta from "./modalVenta";
import MobileCards from "./MobileCards";
import { formatDateSafe } from "@/utils/date";
import { calcularCambio } from "@/utils/util";
import "./TablaCompras.css";

interface TablaComprasProps {
  compras: Compra[];
  preciosActuales?: { [key: string]: number };
  onVender?: (compra: Compra) => void;
  onMarcarVendido?: (compra: Compra) => void;
  userId?: string | null;
  onVentaExitosa?: () => void;
}

const CambioDisplay = ({ cambio }: { cambio: { valor: number; porcentaje: number } | null }) => {
  if (cambio === null) return <div className="text-gray-500 text-sm">-</div>;

  const isPositive = cambio.valor >= 0;

  return (
    <div className={`flex flex-col items-end ${isPositive ? "text-green-500" : "text-red-500"}`}>
      <div className="flex items-center gap-1">
        {isPositive ? <IconoTrendingUp className="w-3 h-3" /> : <IconoTrendingDown className="w-3 h-3" />}
        <span className="font-semibold">${cambio.valor.toFixed(2)}</span>
      </div>
      <div className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
        ({cambio.porcentaje >= 0 ? "+" : ""}{cambio.porcentaje.toFixed(2)}%)
      </div>
    </div>
  );
};

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
  const [modalVentaOpen, setModalVentaOpen] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState<Compra | null>(null);
  const [isLoadingVenta, setIsLoadingVenta] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getVisibleRows = useCallback(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return compras.slice(startIndex, endIndex);
  }, [compras, currentPage, rowsPerPage]);

  const visibleRows = getVisibleRows();
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedRows.includes(row.id));

  const handleAbrirModalVenta = useCallback((compra: Compra) => {
    if (compra.vendida) return;
    if (!userId) {
      alert("Error: No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.");
      return;
    }
    setCompraSeleccionada(compra);
    setModalVentaOpen(true);
  }, [userId]);

  const handleConfirmarVenta = useCallback(async (data: {
    cantidad: number;
    tipoOrden: "MARKET" | "LIMIT";
    precioLimite?: number;
    quoteQuantity?: number;
  }) => {
    if (!compraSeleccionada || !userId) return;

    setIsLoadingVenta(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const payload = {
        compraId: compraSeleccionada.id,
        symbol: compraSeleccionada.simbolo,
        type: data.tipoOrden,
        ...(data.quoteQuantity ? { quoteQuantity: data.quoteQuantity } : { quantity: data.cantidad }),
        ...(data.tipoOrden === "LIMIT" && data.precioLimite && { price: data.precioLimite }),
      };

      const response = await fetch(`${BACKEND_URL}/api/binance/user/${userId}/sell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Error al ejecutar la venta");
      }

      setModalVentaOpen(false);
      setCompraSeleccionada(null);
      alert(`Venta ejecutada exitosamente. Orden ID: ${result.localId || result.order?.orderId}`);
      onVentaExitosa?.();
    } catch (error) {
      alert(`Error al ejecutar la venta: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setIsLoadingVenta(false);
    }
  }, [compraSeleccionada, userId, onVentaExitosa]);

  const handleVender = useCallback((compra: Compra) => {
    onVender ? onVender(compra) : handleAbrirModalVenta(compra);
  }, [onVender, handleAbrirModalVenta]);

  const handleMarcarVendido = useCallback((compra: Compra) => {
    onMarcarVendido ? onMarcarVendido(compra) : console.log("Marcar como vendida:", compra);
  }, [onMarcarVendido]);

  const handleRowSelect = useCallback((id: number) => {
    setSelectedRows((prev) => prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]);
  }, []);

  const handleSelectAllVisible = useCallback(() => {
    const visibleRowIds = visibleRows.map((row) => row.id);
    setSelectedRows((prev) => 
      allVisibleSelected 
        ? prev.filter((id) => !visibleRowIds.includes(id))
        : [...new Set([...prev, ...visibleRowIds])]
    );
  }, [allVisibleSelected, visibleRows]);

  const customStyles: TableStyles = {
    table: { style: { width: "100%" } },
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
        "&:hover": { backgroundColor: "var(--surface) !important" },
      },
      stripedStyle: { backgroundColor: "var(--surface)" },
    },
    pagination: {
      style: {
        backgroundColor: "var(--card-bg)",
        color: "var(--foreground)",
        borderTop: "1px solid var(--card-border)",
      },
    },
  };

  const baseColumnProps = {
    style: { paddingLeft: "10px", paddingRight: "10px" },
    headerStyle: { paddingLeft: "10px", paddingRight: "10px" },
  };

  const baseColumns: TableColumn<Compra>[] = [
    { name: "Exchange", selector: (row) => row.exchange, sortable: true, width: "12%", ...baseColumnProps, style: { minWidth: "110px" } },
    { name: "Símbolo", selector: (row) => row.simbolo, sortable: true, width: "10%", ...baseColumnProps, style: { minWidth: "100px" } },
    { name: "Precio", selector: (row) => row.precio, sortable: true, format: (row) => `$${row.precio.toFixed(2)}`, width: "11%", ...baseColumnProps, style: { minWidth: "105px" } },
    { name: "Cantidad", selector: (row) => row.cantidad, sortable: true, format: (row) => row.cantidad.toFixed(4), width: "11%", ...baseColumnProps, style: { minWidth: "105px" } },
    { name: "Total", selector: (row) => row.total, sortable: true, format: (row) => `$${row.total.toFixed(2)}`, width: "11%", ...baseColumnProps, style: { minWidth: "105px" } },
    { 
      name: "Cambio", 
      cell: (row) => {
        const precioActual = preciosActuales[row.simbolo];
        const cambio = calcularCambio(row, precioActual);
        return <CambioDisplay cambio={cambio} />;
      },
      sortable: true,
      sortFunction: (rowA, rowB) => {
        const precioActualA = preciosActuales[rowA.simbolo];
        const cambioA = calcularCambio(rowA, precioActualA);
        const precioActualB = preciosActuales[rowB.simbolo];
        const cambioB = calcularCambio(rowB, precioActualB);
        return (cambioA?.valor || 0) - (cambioB?.valor || 0);
      },
      width: "10%", 
      ...baseColumnProps, 
      style: { minWidth: "100px" } 
    },
    { 
      name: "Comisión", 
      selector: (row) => row.comision || 0, 
      sortable: true, 
      format: (row) => `${(row.comision || 0).toFixed(2)} ${row.comisionMoneda || ""}`, 
      width: "10%", 
      ...baseColumnProps, 
      style: { minWidth: "100px" } 
    },
    { 
      name: "Fecha", 
      selector: (row) => row.fechaCompra, 
      sortable: true, 
      format: (row) => formatDateSafe(row.fechaCompra), 
      width: "10%", 
      ...baseColumnProps, 
      style: { minWidth: "100px" } 
    },
    { 
      name: "Acciones", 
      cell: (row) => (
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

  const columns: TableColumn<Compra>[] = useMemo(() => {
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
        cell: (row) => (
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
  }, [isMobile, allVisibleSelected, selectedRows, handleSelectAllVisible, handleRowSelect, handleVender, handleMarcarVendido, preciosActuales]);

  const precioActualModal = compraSeleccionada ? preciosActuales[compraSeleccionada.simbolo] || 0 : 0;

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
                onChangePage={setCurrentPage}
                onChangeRowsPerPage={(newPerPage, page) => {
                  setRowsPerPage(newPerPage);
                  setCurrentPage(page);
                }}
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