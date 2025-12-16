import DataTable, {
    TableColumn,
    TableStyles,
  } from "react-data-table-component";
  import { useMemo, useState, useEffect, useCallback } from "react";
  import { Venta } from "@/interfaces/comun.types"; // Necesitarás crear esta interfaz
  import {
    IconoTrendingUp,
    IconoTrendingDown,
  } from "@/components/controles/Iconos";
  import "./TablaVentas.css"; // Crearás este archivo CSS
  
  interface TablaVentasProps {
    ventas: Venta[];
    // Eliminamos onVender y onMarcarVendido ya que no hay acciones
  }
  
  // Interfaz Venta (deberías agregarla a comun.types)
  // interface Venta {
  //   id: number;
  //   exchange: string;
  //   simbolo: string;
  //   precioCompra: number;
  //   precioVenta: number;
  //   cantidad: number;
  //   totalCompra: number;
  //   totalVenta: number;
  //   beneficio: number;
  //   porcentajeBeneficio: number;
  //   comision: number;
  //   comisionMoneda?: string;
  //   fechaVenta: string;
  // }
  
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
  
  // Componente para mostrar el beneficio (similar a CambioDisplay)
  const BeneficioDisplay = ({
    beneficio,
    porcentaje,
  }: {
    beneficio: number;
    porcentaje: number;
  }) => {
    const isPositive = beneficio >= 0;
  
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
          <span className="font-semibold">${beneficio.toFixed(2)}</span>
        </div>
        <div
          className={`text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}
        >
          ({porcentaje >= 0 ? "+" : ""}
          {porcentaje.toFixed(2)}%)
        </div>
      </div>
    );
  };
  
  // Componente separado para las tarjetas móviles
  const MobileCards = ({
    ventas,
  }: {
    ventas: Venta[];
  }) => (
    <div className="mobile-cards-container">
      {ventas.map((venta, index) => {
        return (
          <div key={venta.id || index} className="venta-card">
            <div className="card-row">
              <span className="label">Exchange:</span>
              <span className="value">{venta.exchange}</span>
            </div>
            <div className="card-row">
              <span className="label">Símbolo:</span>
              <span className="value">{venta.simbolo}</span>
            </div>
            <div className="card-row">
              <span className="label">Precio Compra:</span>
              <span className="value">${venta.precioCompra.toFixed(2)}</span>
            </div>
            <div className="card-row">
              <span className="label">Precio Venta:</span>
              <span className="value">${venta.precioVenta.toFixed(2)}</span>
            </div>
            <div className="card-row">
              <span className="label">Cantidad:</span>
              <span className="value">{venta.cantidad.toFixed(4)}</span>
            </div>
            <div className="card-row">
              <span className="label">Total Compra:</span>
              <span className="value">${venta.totalCompra?.toFixed(2)}</span>
            </div>
            <div className="card-row">
              <span className="label">Total Venta:</span>
              <span className="value">${venta.totalVenta?.toFixed(2)}</span>
            </div>
            <div className="card-row">
              <span className="label">Beneficio:</span>
              <div className="value">
                <div className={`flex items-center gap-1 ${venta.beneficio >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {venta.beneficio >= 0 ? (
                    <IconoTrendingUp className="w-4 h-4" />
                  ) : (
                    <IconoTrendingDown className="w-4 h-4" />
                  )}
                  <span>${venta.beneficio.toFixed(2)}</span>
                  <span className="text-xs">
                    ({venta.porcentajeBeneficio >= 0 ? '+' : ''}{venta.porcentajeBeneficio.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="card-row">
              <span className="label">Comisión:</span>
              <span className="value">
                {venta.comision?.toFixed(2)+" " || "0.00 "} {venta.comisionMoneda?.toString() || ""}
              </span>
            </div>
            <div className="card-row">
              <span className="label">Fecha Venta:</span>
              <span className="value">{formatDateSafe(venta.fechaVenta)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const TablaVentas = ({
    ventas,
  }: TablaVentasProps) => {
    const [isMobile, setIsMobile] = useState(false);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
  
    // Calcular las filas visibles en la página actual
    const getVisibleRows = useCallback(() => {
      const startIndex = (currentPage - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return ventas.slice(startIndex, endIndex);
    }, [ventas, currentPage, rowsPerPage]);
  
    // Calcular selectAll solo para las filas visibles
    const visibleRows = getVisibleRows();
    const allVisibleSelected =
      visibleRows.length > 0 &&
      visibleRows.every((row) => selectedRows.includes(row.id));
  
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
  
              // Ajustar las posiciones para las columnas de TablaVentas:
              // 1: Selección, 2: Exchange, 3: Símbolo, 4: PrecioCompra, 5: PrecioVenta,
              // 6: Cantidad, 7: TotalCompra, 8: TotalVenta, 9: Beneficio, 10: Comisión, 11: Fecha
  
              // Columnas centradas (1, 2, 3)
              if ([1, 2, 3].includes(index + 1)) {
                headerElement.style.justifyContent = 'center';
                headerElement.style.textAlign = 'center';
              } 
              // Columnas alineadas a la derecha (4, 5, 6, 7, 8, 9, 10, 11)
              else if ([4, 5, 6, 7, 8, 9, 10, 11].includes(index + 1)) {
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
  
              // Columnas centradas (1, 2, 3)
              if ([1, 2, 3].includes(cellIndex)) {
                cellElement.style.justifyContent = "center";
                cellElement.style.textAlign = "center";
              }
              // Columnas alineadas a la derecha (4, 5, 6, 7, 8, 9, 10, 11)
              else if ([4, 5, 6, 7, 8, 9, 10, 11].includes(cellIndex)) {
                cellElement.style.justifyContent = "flex-end";
                cellElement.style.textAlign = "right";
              }
            });
          }, 100);
        };
  
        // Ejecutar al montar y cuando cambien los datos o la página
        forceHeaderAlignment();
  
        // También ejecutar cuando cambie el tamaño de la ventana
        window.addEventListener("resize", forceHeaderAlignment);
  
        return () => {
          window.removeEventListener("resize", forceHeaderAlignment);
        };
      }
    }, [isMobile, ventas, currentPage, rowsPerPage]);
  
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
  
    const columns: TableColumn<Venta>[] = useMemo(() => {
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
  
      const baseColumns: TableColumn<Venta>[] = [
        {
          name: "Exchange",
          selector: (row: Venta) => row.exchange,
          sortable: true,
          width: "12%",
          ...baseColumnProps,
          style: { minWidth: "110px" }
        },
        {
          name: "Símbolo",
          selector: (row: Venta) => row.simbolo,
          sortable: true,
          width: "10%",
          ...baseColumnProps,
          style: { minWidth: "100px" }
        },
        {
          name: "Precio Compra",
          selector: (row: Venta) => row.precioCompra,
          sortable: true,
          format: (row: Venta) => `$${row.precioCompra.toFixed(2)}`,
          width: "11%",
          ...baseColumnProps,
          style: { minWidth: "105px" }
        },
        {
          name: "Precio Venta",
          selector: (row: Venta) => row.precioVenta,
          sortable: true,
          format: (row: Venta) => `$${row.precioVenta.toFixed(2)}`,
          width: "11%",
          ...baseColumnProps,
          style: { minWidth: "105px" }
        },
        {
          name: "Cantidad",
          selector: (row: Venta) => row.cantidad,
          sortable: true,
          format: (row: Venta) => row.cantidad.toFixed(4),
          width: "11%",
          ...baseColumnProps,
          style: { minWidth: "105px" }
        },
        {
          name: "Total Compra",
          selector: (row: Venta) => row.totalCompra,
          sortable: true,
          format: (row: Venta) => `$${row.totalCompra.toFixed(2)}`,
          width: "11%",
          ...baseColumnProps,
          style: { minWidth: "105px" }
        },
        {
          name: "Total Venta",
          selector: (row: Venta) => row.totalVenta,
          sortable: true,
          format: (row: Venta) => `$${row.totalVenta.toFixed(2)}`,
          width: "11%",
          ...baseColumnProps,
          style: { minWidth: "105px" }
        },
        {
          name: "Beneficio",
          cell: (row: Venta) => (
            <BeneficioDisplay
              beneficio={row.beneficio}
              porcentaje={row.porcentajeBeneficio}
            />
          ),
          sortable: true,
          sortFunction: (rowA: Venta, rowB: Venta) => {
            return rowA.beneficio - rowB.beneficio;
          },
          width: "10%",
          ...baseColumnProps,
          style: { minWidth: "100px" }
        },
        {
          name: "Comisión",
          selector: (row: Venta) => row.comision || 0,
          sortable: true,
          format: (row: Venta) => `${(row.comision || 0).toFixed(2)} ${row.comisionMoneda || ''}`,
          width: "10%",
          ...baseColumnProps,
          style: { minWidth: "100px" }
        },
        {
          name: "Fecha Venta",
          selector: (row: Venta) => row.fechaVenta,
          sortable: true,
          format: (row: Venta) => formatDateSafe(row.fechaVenta),
          width: "10%",
          ...baseColumnProps,
          style: { minWidth: "100px" }
        },
      ];
  
      // Añadir columna de selección solo si no es móvil
      if (!isMobile) {
        const selectionColumn: TableColumn<Venta> = {
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
          cell: (row: Venta) => (
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
          style: { minWidth: "50px" }
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
    ]);
  
    return (
      <div className="ventas-table-container">
        {isMobile ? (
          <MobileCards
            ventas={ventas}
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
                data={ventas}
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
                    No se encontraron ventas
                  </div>
                }
              />
            </div>
          </>
        )}
      </div>
    );
  };
  
  export default TablaVentas;