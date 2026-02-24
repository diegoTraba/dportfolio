// components/tablas/TablaVentas.tsx
import DataTable, { TableColumn, TableStyles } from "react-data-table-component";
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
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* -------------------- Responsive -------------------- */
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  /* -------------------- Selección -------------------- */
  const handleRowSelect = useCallback((id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === ventas.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(ventas.map((v) => v.id));
    }
  }, [ventas, selectedRows]);

  /* -------------------- ESTILOS -------------------- */
  const customStyles: TableStyles = {
    table: {
      style: {
        width: "100%",
        tableLayout: "auto",
      },
    },
    headRow: {
      style: {
        backgroundColor: "var(--header-bg)",
        borderBottom: "2px solid var(--header-border)",
        minHeight: "52px",
      },
    },
    headCells: {
      style: {
        padding: "5px",
        fontSize: "14px",
        fontWeight: "600",
        color: "var(--foreground)",
        display: "flex",
        alignItems: "center",
        
      },
    },
    rows: {
      style: {
        backgroundColor: "var(--card-bg)",
        borderBottom: "1px solid var(--card-border)",
        "&:hover": {
          backgroundColor: "var(--surface)",
        },
      },
      stripedStyle: {
        backgroundColor: "var(--surface)",
      },
    },
    cells: {
      style: {
        padding: "5px",
        fontSize: "14px",
        color: "var(--foreground)",
        display: "flex",
        alignItems: "center",
      },
    },
    pagination: {
      style: {
        backgroundColor: "var(--card-bg)",
        borderTop: "1px solid var(--card-border)",
      },
    },
  };

  /* -------------------- COLUMNAS -------------------- */
  const columns: TableColumn<Venta>[] = useMemo(() => {
    const baseColumns: TableColumn<Venta>[] = [
      {
        name: "Exchange",
        selector: (row) => row.exchange,
        sortable: true,
        grow: 0.9,
        style: {
          justifyContent: "center",
          textAlign: "center",
        },
      },
      {
        name: "Símbolo",
        selector: (row) => row.simbolo,
        sortable: true,
        grow: 0.9,
        style: {
          justifyContent: "center",
          textAlign: "center",
        },
      },
      {
        name: "P. Compra",
        selector: (row) => row.compras?.precio ?? 0,
        format: (row) => `$${row.compras?.precio.toFixed(3)}`,
        sortable: true,
        grow: 1,
        wrap: true,
        style: {
          justifyContent: "flex-end",
          textAlign: "right",
        },
      },
      {
        name: "P. Venta",
        selector: (row) => row.precioVenta,
        format: (row) => `$${row.precioVenta.toFixed(3)}`,
        sortable: true,
        grow: 1,
        wrap: true,
        style: {
          justifyContent: "flex-end",
          textAlign: "right",
        },
      },
      {
        name: "Cantidad",
        selector: (row) => row.cantidadVendida,
        format: (row) => row.cantidadVendida.toFixed(4),
        sortable: true,
        grow: 1,
        wrap: true,
        style: {
          justifyContent: "flex-end",
          textAlign: "right",
        },
      },
      {
        name: "Total",
        selector: (row) => row.compras?.total ?? 0,
        format: (row) => `$${row.compras?.total.toFixed(2)}`,
        sortable: true,
        grow: 1,
        wrap: true,
        style: {
          justifyContent: "flex-end",
          textAlign: "right",
        },
      },
      {
        name: "Beneficio",
        cell: (row) => (
          <div className="w-full text-right">
            <BeneficioDisplay
              beneficio={row.beneficio}
              porcentajeBeneficio={row.porcentajeBeneficio}
              tamaño="sm"
            />
          </div>
        ),
        sortable: true,
        sortFunction: (a, b) => a.beneficio - b.beneficio,
        grow: 0.9,
        style: {
          justifyContent: "flex-end",
          textAlign: "right",
        },
      },
      {
        name: "Comisión",
        selector: (row) => row.comision || 0,
        format: (row) =>
          `${(row.comision || 0).toFixed(2)} ${row.comisionMoneda || ""}`,
        sortable: true,
        grow: 1,
        wrap: true,
        style: {
          justifyContent: "flex-end",
          textAlign: "right",
        },
      },
      {
        name: "Fecha",
        selector: (row) => row.fechaVenta,
        format: (row) => formatDateSafe(row.fechaVenta, true),
        sortable: true,
        grow: 1,
        style: {
          justifyContent: "flex-end",
          textAlign: "right",
          marginRight: "8px"
        },
      },
    ];

    if (!isMobile) {
      const selectionColumn: TableColumn<Venta> = {
        name: (
          <input
            type="checkbox"
            checked={selectedRows.length === ventas.length && ventas.length > 0}
            onChange={handleSelectAll}
          />
        ),
        cell: (row) => (
          <input
            type="checkbox"
            checked={selectedRows.includes(row.id)}
            onChange={() => handleRowSelect(row.id)}
          />
        ),
        width: "40px",
        style: {
          justifyContent: "center",
          textAlign: "center",
        },
        grow: 0,
      };

      return [selectionColumn, ...baseColumns];
    }

    return baseColumns;
  }, [isMobile, ventas, selectedRows, handleSelectAll, handleRowSelect]);

  /* -------------------- RENDER -------------------- */
  return (
    <div className="ventas-table-container">
      {isMobile ? (
        <MobileCardsVentas ventas={ventas} />
      ) : (
        <>
          {selectedRows.length > 0 && (
            <div className="mb-4 p-3 bg-alerta-activa border border-alerta-activa rounded-lg">
              {selectedRows.length} fila(s) seleccionada(s)
            </div>
          )}

          <div className="datatable-wrapper">
            <DataTable
              columns={columns}
              data={ventas}
              customStyles={customStyles}
              pagination
              paginationPerPage={rowsPerPage}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              onChangeRowsPerPage={(perPage) => setRowsPerPage(perPage)}
              highlightOnHover
              striped
              fixedHeader
              fixedHeaderScrollHeight="600px"
              responsive={false}
              noDataComponent={
                <div className="py-8 opacity-70">No se encontraron ventas</div>
              }
              paginationComponentOptions={{
                rowsPerPageText: "Filas por página",
                rangeSeparatorText: "de",        // Para "1-10 de 100"
                noRowsPerPage: false,            // Si quieres ocultar el selector, true lo oculta
                selectAllRowsItem: false,
                selectAllRowsItemText: "Todos",  // Si activas selectAllRows
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default TablaVentas;
