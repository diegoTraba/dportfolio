import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Compra } from "@/interfaces/comun.types";
import { 
  IconoReloj, 
  IconoCheckCircle, 
  IconoDolar,
  IconoEtiqueta 
} from '@/components/controles/Iconos';
import './TablaCompras.css';

interface TablaComprasProps {
  compras: Compra[];
  onVender?: (compra: Compra) => void;
  onMarcarVendido?: (compra: Compra) => void;
}

// Función auxiliar para formatear fechas de manera segura
const formatDateSafe = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    // Formatear a dd/mm/yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formateando fecha:', dateString, error);
    return 'Fecha inválida';
  }
};

// Componente para el botón de estado
const EstadoButton = ({ vendida }: { vendida?: boolean }) => {
  const estado = vendida ? 'vendida' : 'pendiente';
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
  onVender,
  onMarcarVendido,
}: {
  compras: Compra[];
  onVender: (compra: Compra) => void;
  onMarcarVendido: (compra: Compra) => void;
}) => (
  <div className="mobile-cards-container">
    {compras.map((compra, index) => (
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
          <span className="label">Precio:</span>
          <span className="value">${compra.precio.toFixed(2)}</span>
        </div>
        <div className="card-row">
          <span className="label">Cantidad:</span>
          <span className="value">{compra.cantidad.toFixed(4)}</span>
        </div>
        <div className="card-row">
          <span className="label">Total:</span>
          <span className="value">${compra.total?.toFixed(2)}</span>
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

        {/* Nueva fila para Estado en móvil */}
        <div className="card-row">
          <span className="label">Estado:</span>
          <div className="value flex items-center gap-2">
            <EstadoButton vendida={compra.vendida} />
          </div>
        </div>
        {/* Nueva fila para Acciones en móvil */}
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
    ))}
  </div>
);

const TablaCompras = ({ 
  compras, 
  onVender, 
  onMarcarVendido 
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
  const handleVender = useCallback((compra: Compra) => {
    if (compra.vendida) {
      // Si ya está vendida, no hacer nada
      console.log('Esta compra ya está vendida');
      return;
    }
    
    if (onVender) {
      onVender(compra);
    } else {
      console.log('Vender compra:', compra);
      // Aquí iría la lógica para abrir modal de venta
    }
  }, [onVender]);

  const handleMarcarVendido = useCallback((compra: Compra) => {
    if (onMarcarVendido) {
      onMarcarVendido(compra);
    } else {
      console.log('Marcar como vendida:', compra);
      // Aquí iría la lógica para cambiar el estado a vendida
      // Ejemplo: actualizarCompra(compra.id, { vendida: true });
    }
  }, [onMarcarVendido]);

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
          const columnHeaders = document.querySelectorAll('div[role="columnheader"]');
          
          columnHeaders.forEach((header, index) => {
            const headerElement = header as HTMLElement;
            
            // Asegurar que tenga display flex
            headerElement.style.display = 'flex';
            headerElement.style.alignItems = 'center';
            
            // Si hay columna de selección (checkbox), las posiciones son:
            // 1: Selección, 2: Exchange, 3: Símbolo, 4: Precio, 5: Cantidad, 
            // 6: Total, 7: Comisión, 8: Fecha, 9: Estado, 10: Acciones
            
            // Columnas centradas (1, 2, 3, 9, 10)
            if ([1, 2, 3, 9, 10].includes(index + 1)) {
              headerElement.style.justifyContent = 'center';
              headerElement.style.textAlign = 'center';
            } 
            // Columnas alineadas a la derecha (4, 5, 6, 7, 8)
            else if ([4, 5, 6, 7, 8].includes(index + 1)) {
              headerElement.style.justifyContent = 'flex-end';
              headerElement.style.textAlign = 'right';
            }
          });
          
          // También aplicar a las celdas de contenido
          const gridCells = document.querySelectorAll('div[role="gridcell"]');
          
          gridCells.forEach((cell, index) => {
            const cellElement = cell as HTMLElement;
            
            // Calcular la posición de la columna dentro de la fila
            const cellIndex = Array.from(cell.parentElement?.children || []).indexOf(cell) + 1;
            
            // Asegurar que tenga display flex
            cellElement.style.display = 'flex';
            cellElement.style.alignItems = 'center';
            
            // Columnas centradas (1, 2, 3, 9, 10)
            if ([1, 2, 3, 9, 10].includes(cellIndex)) {
              cellElement.style.justifyContent = 'center';
              cellElement.style.textAlign = 'center';
            } 
            // Columnas alineadas a la derecha (4, 5, 6, 7, 8)
            else if ([4, 5, 6, 7, 8].includes(cellIndex)) {
              cellElement.style.justifyContent = 'flex-end';
              cellElement.style.textAlign = 'right';
            }
          });
        }, 100); // Pequeño delay para asegurar que la tabla se haya renderizado
      };
      
      // Ejecutar al montar y cuando cambien los datos o la página
      forceHeaderAlignment();
      
      // También ejecutar cuando cambie el tamaño de la ventana
      window.addEventListener('resize', forceHeaderAlignment);
      
      return () => {
        window.removeEventListener('resize', forceHeaderAlignment);
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
    // Configuración básica para todas las columnas
    const baseColumnProps = {
      style: {
        paddingLeft: "12px",
        paddingRight: "12px",
      },
      headerStyle: {
        paddingLeft: "12px",
        paddingRight: "12px",
      }
    };

    const baseColumns: TableColumn<Compra>[] = [
      {
        name: "Exchange",
        selector: (row: Compra) => row.exchange,
        sortable: true,
        width: "10%",
        minWidth: "100px",
        ...baseColumnProps
      },
      {
        name: "Símbolo",
        selector: (row: Compra) => row.simbolo,
        sortable: true,
        width: "10%",
        minWidth: "100px",
        ...baseColumnProps
      },
      {
        name: "Precio",
        selector: (row: Compra) => row.precio,
        sortable: true,
        format: (row: Compra) => `$${row.precio.toFixed(2)}`,
        width: "10%",
        minWidth: "100px",
        ...baseColumnProps
      },
      {
        name: "Cantidad",
        selector: (row: Compra) => row.cantidad,
        sortable: true,
        format: (row: Compra) => row.cantidad.toFixed(4),
        width: "11%",
        minWidth: "100px",
        ...baseColumnProps
      },
      {
        name: "Total",
        selector: (row: Compra) => row.total,
        sortable: true,
        format: (row: Compra) => `$${row.total.toFixed(2)}`,
        width: "9%",
        minWidth: "100px",
        ...baseColumnProps
      },
      {
        name: "Comisión",
        selector: (row: Compra) => row.comision || 0,
        sortable: true,
        format: (row: Compra) => `$${(row.comision || 0).toFixed(2)}`,
        width: "10%",
        minWidth: "100px",
        ...baseColumnProps
      },
      {
        name: "Fecha",
        selector: (row: Compra) => row.fechaCompra,
        sortable: true,
        format: (row: Compra) => formatDateSafe(row.fechaCompra),
        width: "12%",
        minWidth: "110px",
        ...baseColumnProps
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
        width: '13%',
        minWidth: '130px',
        ...baseColumnProps
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
        width: '10%',
        minWidth: '120px',
        ...baseColumnProps
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
        width: "5%",
        minWidth: "60px",
        ...baseColumnProps
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
    handleMarcarVendido
  ]);

  return (
    <div className="compras-table-container">
      {isMobile ? (
        <MobileCards compras={compras} onVender={handleVender} onMarcarVendido={handleMarcarVendido} />
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