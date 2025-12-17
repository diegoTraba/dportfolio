import { Compra } from "@/interfaces/comun.types";
import { IconoDolar, IconoEtiqueta, IconoTrendingUp, IconoTrendingDown } from "@/components/controles/Iconos";
import { formatDateSafe } from "@/utils/date";
import { calcularCambio } from "@/utils/util";

interface MobileCardsProps {
  compras: Compra[];
  preciosActuales: { [key: string]: number };
  onVender: (compra: Compra) => void;
  onMarcarVendido: (compra: Compra) => void;
}

const MobileCards: React.FC<MobileCardsProps> = ({
  compras,
  preciosActuales = {},
  onVender,
  onMarcarVendido,
}) => {
  return (
    <div className="mobile-cards-container">
      {compras.map((compra) => {
        const precioActual = preciosActuales[compra.simbolo];
        const cambio = calcularCambio(compra, precioActual);
        const cantidadDisponible = compra.cantidadRestante || compra.cantidad;

        return (
          <div key={compra.id} className="purchase-card">
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
                {precioActual ? `$${precioActual.toFixed(2)}` : "-"}
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
                <span className="value">${cambio.totalActual?.toFixed(2)}</span>
              </div>
            )}
            <div className="card-row">
              <span className="label">Cambio:</span>
              <div className="value">
                {cambio ? (
                  <div
                    className={`flex items-center gap-1 ${cambio.valor >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {cambio.valor >= 0 ? (
                      <IconoTrendingUp className="w-4 h-4" />
                    ) : (
                      <IconoTrendingDown className="w-4 h-4" />
                    )}
                    <span>${cambio.valor.toFixed(2)}</span>
                    <span className="text-xs">
                      ({cambio.porcentaje >= 0 ? "+" : ""}
                      {cambio.porcentaje.toFixed(2)}%)
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
                {compra.comision?.toFixed(2) + " " || "0.00 "}{" "}
                {compra.comisionMoneda?.toString() || ""}
              </span>
            </div>
            <div className="card-row">
              <span className="label">Fecha:</span>
              <span className="value">{formatDateSafe(compra.fechaCompra)}</span>
            </div>
            <div className="card-row">
              <span className="label">Estado:</span>
              <span className="value">
                {compra.vendida ? (
                  <span className="text-green-500 font-medium">Vendida</span>
                ) : cantidadDisponible < compra.cantidad ? (
                  <span className="text-blue-500 font-medium">
                    Parcialmente vendida
                  </span>
                ) : (
                  <span className="text-gray-500">Disponible</span>
                )}
              </span>
            </div>
            <div className="card-row">
              <span className="label">Acciones:</span>
              <div className="value flex items-center gap-2">
                <button
                  onClick={() => onVender(compra)}
                  className={`p-1.5 rounded-lg transition-colors ${compra.vendida ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"}`}
                  title="Vender"
                  disabled={compra.vendida}
                >
                  <IconoDolar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMarcarVendido(compra)}
                  className={`p-1.5 rounded-lg transition-colors ${compra.vendida ? "bg-green-500/20 text-green-500" : "bg-green-500/10 hover:bg-green-500/20 text-green-500"}`}
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
};

export default MobileCards;