import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { Compra } from '@/interfaces/comun.types'

interface TablaComprasProps {
  compras: Compra[];
}

// Componente separado para las tarjetas móviles
const MobileCards = ({ compras }: { compras: Compra[] }) => (
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
          <span className="value">${compra.comision?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="card-row">
          <span className="label">Fecha:</span>
          <span className="value">{compra.fechaCompra}</span>
        </div>
      </div>
    ))}
  </div>
);

const TablaCompras = ({ compras }: TablaComprasProps) => {
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
  const allVisibleSelected = visibleRows.length > 0 && 
    visibleRows.every(row => selectedRows.includes(row.id));

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Manejar selección individual
  const handleRowSelect = useCallback((id: number) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  // Manejar selección de todas las filas VISIBLES
  const handleSelectAllVisible = useCallback(() => {
    const visibleRowIds = visibleRows.map(row => row.id);
    
    if (allVisibleSelected) {
      // Deseleccionar todas las filas visibles
      setSelectedRows(prev => prev.filter(id => !visibleRowIds.includes(id)));
    } else {
      // Seleccionar todas las filas visibles
      setSelectedRows(prev => {
        const newSelection = [...prev];
        visibleRowIds.forEach(id => {
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
  const handlePerRowsChange = useCallback((newPerPage: number, page: number) => {
    setRowsPerPage(newPerPage);
    setCurrentPage(page);
  }, []);

  const columns: TableColumn<Compra>[] = useMemo(() => {
    // Definir baseColumns dentro del useMemo
    const baseColumns: TableColumn<Compra>[] = [
      {
        name: 'Exchange',
        selector: (row: Compra) => row.exchange,
        sortable: true,
        width: '12%',
        minWidth: '80px',
        style: {
          textAlign: 'center',
          paddingLeft: '8px',
          paddingRight: '8px',
        }
      },
      {
        name: 'Símbolo',
        selector: (row: Compra) => row.simbolo,
        sortable: true,
        width: '12%',
        minWidth: '100px',
        style: {
          textAlign: 'center',
        }
      },
      {
        name: 'Precio',
        selector: (row: Compra) => row.precio,
        sortable: true,
        format: (row: Compra) => `$${row.precio.toFixed(2)}`,
        width: '12%',
        minWidth: '100px',
        right: true,
      },
      {
        name: 'Cantidad',
        selector: (row: Compra) => row.cantidad,
        sortable: true,
        format: (row: Compra) => row.cantidad.toFixed(4),
        width: '15%',
        minWidth: '120px',
        right: true,
      },
      {
        name: 'Total',
        selector: (row: Compra) => row.total,
        sortable: true,
        format: (row: Compra) => `$${row.total.toFixed(2)}`,
        width: '13%',
        minWidth: '100px',
        right: true,
      },
      {
        name: 'Comisión',
        selector: (row: Compra) => row.comision || 0,
        sortable: true,
        format: (row: Compra) => `$${(row.comision || 0).toFixed(2)}`,
        width: '12%',
        minWidth: '100px',
        right: true,
      },
      {
        name: 'Fecha',
        selector: (row: Compra) => row.fechaCompra,
        sortable: true,
        width: '14%',
        minWidth: '120px',
        format: (row: Compra) => new Date(row.fechaCompra).toLocaleDateString(),
        right: true,
      },
    ];

    // Añadir columna de selección solo si no es móvil
    if (!isMobile) {
      const selectionColumn: TableColumn<Compra> = {
        name: (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={handleSelectAllVisible}
              className="h-4 w-4 rounded border-gray-300 text-[var(--colorTerciario)] focus:ring-[var(--colorTerciario)]"
            />
          </div>
        ),
        cell: (row: Compra) => (
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={selectedRows.includes(row.id)}
              onChange={() => handleRowSelect(row.id)}
              className="h-4 w-4 rounded border-gray-300 text-[var(--colorTerciario)] focus:ring-[var(--colorTerciario)]"
            />
          </div>
        ),
        sortable: false,
        width: '5%',
        minWidth: '50px',
        style: {
          textAlign: 'center',
        },
      };

      return [selectionColumn, ...baseColumns];
    }

    return baseColumns;
  }, [isMobile, allVisibleSelected, selectedRows, handleSelectAllVisible, handleRowSelect]);

  // Estilos mínimos para evitar errores de tipo
  const customStyles = {
    table: {
      style: {
        width: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: 'var(--header-bg)',
        color: 'var(--foreground)',
        fontSize: '14px',
        fontWeight: 'bold',
        minHeight: '52px',
        borderBottom: '2px solid var(--header-border)',
      },
    },
    headCells: {
      style: {
        backgroundColor: 'var(--header-bg)',
        color: 'var(--foreground)',
        fontSize: '14px',
        fontWeight: 'bold',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    cells: {
      style: {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--foreground)',
        fontSize: '14px',
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
    rows: {
      style: {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--foreground)',
        borderBottom: '1px solid var(--card-border)',
        '&:hover': {
          backgroundColor: 'var(--surface) !important',
        },
      },
      stripedStyle: {
        backgroundColor: 'var(--surface)',
      },
    },
    pagination: {
      style: {
        backgroundColor: 'var(--card-bg)',
        color: 'var(--foreground)',
        borderTop: '1px solid var(--card-border)',
      },
    },
  };

  return (
    <div className="compras-table-container">
      {isMobile ? (
        <MobileCards compras={compras} />
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
            // Eliminamos fixedHeader y fixedHeaderScrollHeight para evitar scroll vertical innecesario
            noDataComponent={
              <div className="text-center py-8 text-custom-foreground opacity-70">
                No se encontraron operaciones
              </div>
            }
          />
        </>
      )}
    </div>
  );
};

export default TablaCompras;