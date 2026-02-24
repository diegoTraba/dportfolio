// components/tablas/MobileCardsVentas.tsx
import { Venta } from "@/interfaces/comun.types";
import BeneficioDisplay from "./BeneficioDisplay";
import { formatDateSafe } from "@/utils/date";

interface MobileCardsVentasProps {
  ventas: Venta[];
}

const MobileCardsVentas = ({ ventas }: MobileCardsVentasProps) => {
  return (
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
              <span className="value">${venta.compras?.precio.toFixed(2)}</span>
            </div>
            <div className="card-row">
              <span className="label">Precio Venta:</span>
              <span className="value">${venta.precioVenta.toFixed(2)}</span>
            </div>
            <div className="card-row">
              <span className="label">Cantidad:</span>
              <span className="value">{venta.cantidadVendida.toFixed(4)}</span>
            </div>
            <div className="card-row">
              <span className="label">Total Compra:</span>
              <span className="value">${venta.compras?.total.toFixed(2)}</span>
            </div>
            {/* <div className="card-row">
              <span className="label">Total Venta:</span>
              <span className="value">${venta.totalVenta?.toFixed(2)}</span>
            </div> */}
            <div className="card-row">
              <span className="label">Beneficio:</span>
              <div className="value">
                <BeneficioDisplay
                  beneficio={venta.beneficio}
                  porcentajeBeneficio={venta.porcentajeBeneficio}
                />
              </div>
            </div>
            <div className="card-row">
              <span className="label">Comisión:</span>
              <span className="value">
                {venta.comision?.toFixed(2) || "0.00"}{" "}
                {venta.comisionMoneda?.toString() || ""}
              </span>
            </div>
            <div className="card-row">
              <span className="label">Fecha Venta:</span>
              <span className="value">{formatDateSafe(venta.fechaVenta, true)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MobileCardsVentas;