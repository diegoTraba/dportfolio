import DataTable, { TableColumn } from 'react-data-table-component';
import { useMemo, useState, useEffect } from 'react';

interface Compra {
  id: number;
  date: string;
  product: string;
  quantity: number;
  price: number;
  status: string;
  total?: number;
}

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

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const columns: TableColumn<Compra>[] = useMemo(() => [
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
      // Eliminamos 'right: true' y usamos clase CSS en su lugar
      format: (row: Compra) => row.quantity.toFixed(8),
    },
    {
      name: 'Precio',
      selector: (row: Compra) => row.price,
      sortable: true,
      // Eliminamos 'right: true' y usamos clase CSS en su lugar
      format: (row: Compra) => `$${row.price.toFixed(2)}`,
    },
    {
      name: 'Total',
      selector: (row: Compra) => (row.quantity * row.price),
      sortable: true,
      // Eliminamos 'right: true' y usamos clase CSS en su lugar
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
  ], []);

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
        <DataTable
          columns={columns}
          data={compras}
          customStyles={customStyles}
          responsive
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          striped
          fixedHeader
          noDataComponent={
            <div className="text-center py-8 text-gray-500">
              No se encontraron operaciones
            </div>
          }
        />
      )}
    </div>
  );
};

export default TablaCompras;