// components/tablas/TablaVentas.tsx
import DataTable, {
  TableColumn,
  TableStyles,
} from "react-data-table-component";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Venta } from "@/interfaces/comun.types";
import MobileCardsVentas from "./MobileCardsVentas";
import BeneficioDisplay from "./BeneficioDisplay";
import { formatDateSafe } from "@/utils/date";
import "./TablaVentas.css";

interface TablaVentasProps {
  ventas: Venta[];
}

const TablaVentas = ({ ventas }: TablaVentasProps) => {
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

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Forzar alineación de cabeceras (solo desktop)
  useEffect(() => {
    if (!isMobile) {
      const forceHeaderAlignment = () => {
        setTimeout(() => {
          // Cabeceras de columna
          const columnHeaders = document.querySelectorAll(
            'div[role="columnheader"]'
          );

          columnHeaders.forEach((header, index) => {
            const headerElement = header as HTMLElement;
            headerElement.style.display = "flex";
            headerElement.style.alignItems = "center";

            // Columnas centradas (selección, exchange, símbolo)
            if ([1, 2, 3].includes(index + 1)) {
              headerElement.style.justifyContent = "center";
              headerElement.style.textAlign = "center";
            }
            // Columnas derecha (resto)
            else if ([4, 5, 6, 7, 8, 9, 10, 11].includes(index + 1)) {
              headerElement.style.justifyContent = "flex-end";
              headerElement.style.textAlign = "right";
            }
          });

          // Celdas de contenido
          const gridCells = document.querySelectorAll('div[role="gridcell"]');

          gridCells.forEach((cell) => {
            const cellElement = cell as HTMLElement;
            const cellIndex =
              Array.from(cell.parentElement?.children || []).indexOf(cell) + 1;

            cellElement.style.display = "flex";
            cellElement.style.alignItems = "center";

            if ([1, 2, 3].includes(cellIndex)) {
              cellElement.style.justifyContent = "center";
              cellElement.style.textAlign = "center";
            } else if ([4, 5, 6, 7, 8, 9, 10, 11].includes(cellIndex)) {
              cellElement.style.justifyContent = "flex-end";
              cellElement.style.textAlign = "right";
            }
          });
        }, 100);
      };

      forceHeaderAlignment();
      window.addEventListener("resize", forceHeaderAlignment);
      return () => window.removeEventListener("resize", forceHeaderAlignment);
    }
  }, [isMobile, ventas, currentPage, rowsPerPage]);

  // Handlers
  const handleRowSelect = useCallback((id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAllVisible = useCallback(() => {
    const visibleRowIds = visibleRows.map((row) => row.id);

    setSelectedRows((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleRowIds.includes(id))
        : Array.from(new Set([...prev, ...visibleRowIds]))
    );
  }, [allVisibleSelected, visibleRows]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePerRowsChange = useCallback(
    (newPerPage: number, page: number) => {
      setRowsPerPage(newPerPage);
      setCurrentPage(page);
    },
    []
  );

  // Estilos de la tabla
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

  // Columnas de la tabla
  const columns: TableColumn<Venta>[] = useMemo(() => {
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

    const baseColumns: TableColumn<Venta>[] = [
      {
        name: "Exchange",
        selector: (row: Venta) => row.exchange,
        sortable: true,
        width: "12%",
        ...baseColumnProps,
        style: { minWidth: "110px" },
      },
      {
        name: "Símbolo",
        selector: (row: Venta) => row.simbolo,
        sortable: true,
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
      {
        name: "Precio Compra",
        selector: (row: Venta) => row.compra?.precio ?? row.compra?.precio ?? 0,
        sortable: true,
        format: (row: Venta) => `$${(row.compra?.precio.toFixed(2))}`,
        width: "11%",
        ...baseColumnProps,
        style: { minWidth: "105px" },
      },
      {
        name: "Precio Venta",
        selector: (row: Venta) => row.precioVenta,
        sortable: true,
        format: (row: Venta) => `$${row.precioVenta.toFixed(2)}`,
        width: "11%",
        ...baseColumnProps,
        style: { minWidth: "105px" },
      },
      {
        name: "Cantidad",
        selector: (row: Venta) => row.cantidadVendida,
        sortable: true,
        format: (row: Venta) => row.cantidadVendida.toFixed(4),
        width: "11%",
        ...baseColumnProps,
        style: { minWidth: "105px" },
      },
      {
        name: "Total Compra",
        selector: (row: Venta) => row.compra?.total ?? row.compra?.total ?? 0,
        sortable: true,
        format: (row: Venta) => `$${row.compra?.total.toFixed(2)}`,
        width: "11%",
        ...baseColumnProps,
        style: { minWidth: "105px" },
      },
      {
        name: "Beneficio",
        cell: (row: Venta) => (
          <BeneficioDisplay
            beneficio={row.beneficio}
            porcentajeBeneficio={row.porcentajeBeneficio}
            tamaño="sm"
          />
        ),
        sortable: true,
        sortFunction: (rowA: Venta, rowB: Venta) =>
          rowA.beneficio - rowB.beneficio,
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
      {
        name: "Comisión",
        selector: (row: Venta) => row.comision || 0,
        sortable: true,
        format: (row: Venta) =>
          `${(row.comision || 0).toFixed(2)} ${row.comisionMoneda || ""}`,
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
      {
        name: "Fecha Venta",
        selector: (row: Venta) => row.fechaVenta,
        sortable: true,
        format: (row: Venta) => formatDateSafe(row.fechaVenta),
        width: "10%",
        ...baseColumnProps,
        style: { minWidth: "100px" },
      },
    ];

    // Añadir columna de selección solo en desktop
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
  ]);

  return (
    <div className="ventas-table-container">
      {isMobile ? (
        <MobileCardsVentas ventas={ventas} />
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