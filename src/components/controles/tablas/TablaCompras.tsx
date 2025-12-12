import DataTable, {
  TableColumn,
  TableStyles,
} from "react-data-table-component";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Compra } from "@/interfaces/comun.types";
import {
  IconoReloj,
  IconoCheckCircle,
  IconoDolar,
  IconoEtiqueta,
  IconoTrendingUp,
  IconoTrendingDown,
} from "@/components/controles/Iconos";
import "./TablaCompras.css";

interface TablaComprasProps {
  compras: Compra[];
  preciosActuales?: { [key: string]: number };
  onVender?: (compra: Compra) => void;
  onMarcarVendido?: (compra: Compra) => void;
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

  const totalActual = precioActual * compra.cantidad;
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

// Componente para el botón de estado
const EstadoButton = ({ vendida }: { vendida?: boolean }) => {
  const estado = vendida ? "vendida" : "pendiente";
  const config = {
    pendiente: {
      icon: IconoReloj,
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      label: "Pendiente",
    },
    vendida: {
      icon: IconoCheckCircle,
      color: "bg-green-500",
      textColor: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      label: "Vendida",
    },
  };

  const { icon: Icon, color, bgColor, borderColor, label } = config[estado];

  return (
    <button
      className={`flex items-center justify-center gap-1 px-2 py-1 rounded-full ${bgColor} border ${borderColor} transition-all hover:opacity-80`}
      title={label}
    >
      <Icon className={`w-4 h-4 ${color.replace("bg-", "text-")}`} />
      <span className={`text-xs font-medium ${color.replace("bg-", "text-")}`}>
        {label}
      </span>
    </button>
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
              {precioActual ? `$${precioActual.toFixed(2)}` : '-'}
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
                <div className={`flex items-center gap-1 ${cambio.valor >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {cambio.valor >= 0 ? (
                    <IconoTrendingUp className="w-4 h-4" />
                  ) : (
                    <IconoTrendingDown className="w-4 h-4" />
                  )}
                  <span>${cambio.valor.toFixed(2)}</span>
                  <span className="text-xs">
                    ({cambio.porcentaje >= 0 ? '+' : ''}{cambio.porcentaje.toFixed(2)}%)
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
              ${compra.comision?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="card-row">
            <span className="label">Fecha:</span>
            <span className="value">{formatDateSafe(compra.fechaCompra)}</span>
          </div>

          <div className="card-row">
            <span className="label">Estado:</span>
            <div className="value flex items-center gap-2">
              <EstadoButton vendida={compra.vendida} />
            </div>
          </div>
          <div className="card-row">
            <span className="label">Acciones:</span>
            <div className="value flex items-center gap-2">
              <button
                onClick={() => onVender(compra)}
                className={`p-1.5 rounded-lg transition-colors ${compra.vendida ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500'}`}
                title="Vender"
              >
                <IconoDolar className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMarcarVendido(compra)}
                className={`p-1.5 rounded-lg transition-colors ${compra.vendida ? 'bg-green-500/20 text-green-500' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500'}`}
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
}: TablaComprasProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // Handlers para las acciones
  const handleVender = useCallback(
    (compra: Compra) => {
      if (compra.vendida) {
        // Si ya está vendida, no hacer nada
        console.log("Esta compra ya está vendida");
        return;
      }

      if (onVender) {
        onVender(compra);
      } else {
        console.log("Vender compra:", compra);
        // Aquí iría la lógica para abrir modal de venta
      }
    },
    [onVender]
  );

  const handleMarcarVendido = useCallback(
    (compra: Compra) => {
      if (onMarcarVendido) {
        onMarcarVendido(compra);
      } else {
        console.log("Marcar como vendida:", compra);
        // Aquí iría la lógica para cambiar el estado a vendida
        // Ejemplo: actualizarCompra(compra.id, { vendida: true });
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
            // 6: Total, 7: Cambio, 8: Comisión, 9: Fecha, 10: Estado, 11: Acciones

            // Columnas centradas (1, 2, 3, 10, 11)
            if ([1, 2, 3, 10, 11].includes(index + 1)) {
              headerElement.style.justifyContent = 'center';
              headerElement.style.textAlign = 'center';
            } 
            // Columnas alineadas a la derecha (4, 5, 6, 7, 8, 9)
            else if ([4, 5, 6, 7, 8, 9].includes(index + 1)) {
              headerElement.style.justifyContent = 'flex-end';
              headerElement.style.textAlign = 'right';
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

            // Columnas centradas (1, 2, 3, 10, 11)
            if ([1, 2, 3, 10, 11].includes(cellIndex)) {
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
        // No definimos justifyContent aquí porque lo manejaremos con JS
      },
    },
    cells: {
      style: {
        backgroundColor: "var(--card-bg)",
        color: "var(--foreground)",
        fontSize: "14px",
        paddingLeft: "12px",
        paddingRight: "12px",
        // No definimos justifyContent aquí porque lo manejaremos con JS
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
      }
    };

    const baseColumns: TableColumn<Compra>[] = [
      {
        name: "Exchange",
        selector: (row: Compra) => row.exchange,
        sortable: true,
        width: "10%",
        ...baseColumnProps,
        style:{ minWidth: "100px"}
      },
      {
        name: "Símbolo",
        selector: (row: Compra) => row.simbolo,
        sortable: true,
        width: "8%",
        ...baseColumnProps,
        style:{ minWidth: "90px"}
      },
      {
        name: "Precio",
        selector: (row: Compra) => row.precio,
        sortable: true,
        format: (row: Compra) => `$${row.precio.toFixed(2)}`,
        width: "9%",
        ...baseColumnProps,
        style:{ minWidth: "95px"}
      },
      {
        name: "Cantidad",
        selector: (row: Compra) => row.cantidad,
        sortable: true,
        format: (row: Compra) => row.cantidad.toFixed(4),
        width: "9%",
        ...baseColumnProps,
        style:{ minWidth: "95px"}
      },
      {
        name: "Total",
        selector: (row: Compra) => row.total,
        sortable: true,
        format: (row: Compra) => `$${row.total.toFixed(2)}`,
        width: "9%",
        ...baseColumnProps,
        style:{ minWidth: "95px"}
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
        style:{ minWidth: "100px"}
      },
      {
        name: "Comisión",
        selector: (row: Compra) => row.comision || 0,
        sortable: true,
        format: (row: Compra) => `$${(row.comision || 0).toFixed(2)}`,
        width: "8%",
        ...baseColumnProps,
        style:{ minWidth: "90px"}
      },
      {
        name: "Fecha",
        selector: (row: Compra) => row.fechaCompra,
        sortable: true,
        format: (row: Compra) => formatDateSafe(row.fechaCompra),
        width: "10%",
        ...baseColumnProps,
        style:{ minWidth: "100px"}
      },
      {
        name: 'Estado',
        cell: (row: Compra) => (
          <div className="flex items-center justify-center w-full">
            <EstadoButton vendida={row.vendida} />
          </div>
        ),
        sortable: true,
        sortFunction: (rowA: Compra, rowB: Compra) => {
          const vendidaA = rowA.vendida ? 1 : 0;
          const vendidaB = rowB.vendida ? 1 : 0;
          return vendidaA - vendidaB;
        },
        width: '10%',
        ...baseColumnProps,
        style:{ minWidth: "110px"}
      },
      {
        name: 'Acciones',
        cell: (row: Compra) => (
          <div className="flex items-center justify-center w-full gap-1">
            <button
              onClick={() => handleVender(row)}
              className={`p-1 rounded-lg transition-colors ${row.vendida ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500'}`}
              title={row.vendida ? "Ya vendida" : "Vender"}
              disabled={row.vendida}
            >
              <IconoDolar className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleMarcarVendido(row)}
              className={`p-1 rounded-lg transition-colors ${row.vendida ? 'bg-green-500/20 text-green-500' : 'bg-green-500/10 hover:bg-green-500/20 text-green-500'}`}
              title={row.vendida ? "Ya vendida" : "Marcar como vendida"}
            >
              <IconoEtiqueta className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
        sortable: false,
        width: '11%',
        ...baseColumnProps,
        style:{ minWidth: "120px"}
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
        style:{ minWidth: "50px"}
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
    preciosActuales
  ]);

  return (
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
  );
};

export default TablaCompras;
