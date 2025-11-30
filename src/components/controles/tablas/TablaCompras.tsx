import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo, useState, useEffect, useCallback } from 'react';
import {Compra} from '@/interfaces/comun.types'

interface TablaComprasProps {
  compras: Compra[];
}

// Componente separado para las tarjetas móviles
const MobileCards = ({ compras }: { compras: Compra[] }) => (
  <div className="mobile-cards-container">
    {compras.map((compra, index) => (
      <div key={compra.id || index} className="purchase-card">
        <div className="card-row">
          <span className="label">Fecha:</span>
          <span className="value">{compra.date}</span>
        </div>
        <div className="card-row">
          <span className="label">Símbolo:</span>
          <span className="value">{compra.product}</span>
        </div>
        <div className="card-row">
          <span className="label">Cantidad:</span>
          <span className="value">{compra.quantity.toFixed(8)}</span>
        </div>
        <div className="card-row">
          <span className="label">Precio:</span>
          <span className="value">${compra.price.toFixed(2)}</span>
        </div>
        <div className="card-row">
          <span className="label">Comisión:</span>
          <span className="value">${compra.comision?.toFixed(2) || '0.00'}</span>
        </div>
        <div className="card-row">
          <span className="label">Total:</span>
          <span className="value">${((compra.quantity || 0) * (compra.price || 0)).toFixed(2)}</span>
        </div>
        <div className="card-row">
          <span className="label">Tipo:</span>
          <span className={`status-badge ${compra.status}`}>
            {compra.status}
          </span>
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
        name: 'Fecha',
        selector: (row: Compra) => row.date,
        sortable: true,
      },
      {
        name: 'Símbolo',
        selector: (row: Compra) => row.product,
        sortable: true,
      },
      {
        name: 'Cantidad',
        selector: (row: Compra) => row.quantity,
        sortable: true,
        format: (row: Compra) => row.quantity.toFixed(8),
      },
      {
        name: 'Precio',
        selector: (row: Compra) => row.price,
        sortable: true,
        format: (row: Compra) => `$${row.price.toFixed(2)}`,
      },
      {
        name: 'Comisión',
        selector: (row: Compra) => row.comision || 0,
        sortable: true,
        format: (row: Compra) => `$${(row.comision || 0).toFixed(2)}`,
      },
      {
        name: 'Total',
        selector: (row: Compra) => (row.quantity * row.price),
        sortable: true,
        format: (row: Compra) => `$${(row.quantity * row.price).toFixed(2)}`,
      },
      {
        name: 'Tipo',
        selector: (row: Compra) => row.status,
        sortable: true,
        cell: (row: Compra) => (
          <span className={`status-badge ${row.status}`}>
            {row.status}
          </span>
        ),
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
        style: {
          flexGrow: 0,
          flexShrink: 0,
          width: '120px',
        },
      };

      return [selectionColumn, ...baseColumns];
    }

    return baseColumns;
  }, [isMobile, allVisibleSelected, selectedRows, compras, handleSelectAllVisible, handleRowSelect]);

  // Estilos mínimos para evitar errores de tipo
  const customStyles = {
    headCells: {
      style: {
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: '#f8fafc',
      },
    },
    cells: {
      style: {
        fontSize: '14px',
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
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                {selectedRows.length} fila(s) seleccionada(s)
              </p>
            </div>
          )}
          
          <DataTable
            columns={columns}
            data={compras}
            customStyles={customStyles}
            responsive
            pagination
            paginationPerPage={rowsPerPage}
            paginationRowsPerPageOptions={[10, 25, 50, 100]}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            highlightOnHover
            striped
            fixedHeader
            noDataComponent={
              <div className="text-center py-8 text-gray-500">
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