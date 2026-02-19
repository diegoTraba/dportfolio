import { useState, useEffect } from "react";
import { Compra } from "@/interfaces/comun.types";
import { IconoInfo, IconoCerrar } from "@/components/controles/Iconos";

interface ModalVentaProps {
  isOpen: boolean;
  onClose: () => void;
  compra: Compra | null;
  precioActual: number;
  onConfirmar: (data: {
    cantidad: number;
    tipoOrden: "MARKET" | "LIMIT";
    precioLimite?: number;
    quoteQuantity?: number;
  }) => void;
  isLoading?: boolean;
}

const ModalVenta: React.FC<ModalVentaProps> = ({
  isOpen,
  onClose,
  compra,
  precioActual,
  onConfirmar,
  isLoading = false,
}) => {
  // Estados existentes
  const [cantidad, setCantidad] = useState("");
  const [tipoOrden, setTipoOrden] = useState<"MARKET" | "LIMIT">("MARKET");
  const [precioLimite, setPrecioLimite] = useState("");
  const [quoteQuantity, setQuoteQuantity] = useState("");

  // NUEVOS ESTADOS para stepSize y validación
  const [stepSize, setStepSize] = useState<number>(0.00001);
  const [minQty, setMinQty] = useState<number>(0.00001);
  const [loadingSymbolInfo, setLoadingSymbolInfo] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [isTouched, setIsTouched] = useState(false);
  const [valorCorregido, setValorCorregido] = useState<number | null>(null);

  // NUEVOS ESTADOS para comisiones
  const [commissionRate, setCommissionRate] = useState<number>(0.001); // 0.1% por defecto
  const [commissionAsset, setCommissionAsset] = useState<string>("USDC");
  const [loadingCommission, setLoadingCommission] = useState(false);

  // Resetear estado cuando el modal se cierra
  const handleClose = () => {
    setCantidad("");
    setTipoOrden("MARKET");
    setPrecioLimite("");
    setQuoteQuantity("");
    setValidationError("");
    setIsTouched(false);
    setValorCorregido(null);
    onClose();
  };

  // Efecto principal para inicializar cuando se abre el modal
  useEffect(() => {
    if (isOpen && compra) {
      fetchSymbolInfo(compra.simbolo);
      fetchCommissionRate(compra.simbolo);
    }
  }, [isOpen, compra]);

  // Efecto para calcular cantidad inicial cuando tengamos toda la información
  useEffect(() => {
    if (compra && stepSize > 0) {
      calcularCantidadInicial();
    }
  }, [compra, stepSize]);

  // Función para obtener la tasa de comisión
  const fetchCommissionRate = async (symbol: string) => {
    setLoadingCommission(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(
        `${BACKEND_URL}/api/binance/user-commission-rate/${symbol}`
      );
      const result = await response.json();

      if (result.success) {
        // La tasa de comisión depende si es orden MARKET (taker) o LIMIT (maker)
        const commissionRate = tipoOrden === "LIMIT" 
          ? result.makerRate || result.commissionRate || 0.001
          : result.takerRate || result.commissionRate || 0.001;
        
        setCommissionRate(commissionRate);
        setCommissionAsset(result.commissionAsset || "USDC");
      }
    } catch (error) {
      console.error("Error obteniendo tasa de comisión:", error);
      // En caso de error, usar valores por defecto
      setCommissionRate(0.001);
      setCommissionAsset(symbol.includes("USDC") ? "USDC" : "USDT");
    } finally {
      setLoadingCommission(false);
    }
  };

  // Actualizar comisión cuando cambie el tipo de orden
  useEffect(() => {
    if (compra) {
      fetchCommissionRate(compra.simbolo);
    }
  }, [tipoOrden]);

  // Función para calcular la cantidad máxima válida inicial
  const calcularCantidadInicial = () => {
    if (!compra) return;
    
    const cantidadDisponible = compra.cantidadRestante || compra.cantidad;
    const cantidadMaximaValida = calcularCantidadMaximaValida(cantidadDisponible);
    
    setCantidad(cantidadMaximaValida.toString());
    setValidationError("");
    setIsTouched(false);
    setValorCorregido(null);
  };

  // Función para calcular la cantidad máxima válida
  const calcularCantidadMaximaValida = (cantidadDisponible: number): number => {
    if (stepSize <= 0) return cantidadDisponible;
    
    const maxMultiplier = Math.floor(cantidadDisponible / stepSize);
    const cantidadValida = maxMultiplier * stepSize;
    
    if (cantidadValida < minQty && cantidadDisponible >= minQty) {
      const minMultiplier = Math.ceil(minQty / stepSize);
      const cantidadMinimaValida = minMultiplier * stepSize;
      
      return cantidadMinimaValida <= cantidadDisponible ? cantidadMinimaValida : 0;
    }
    
    return cantidadValida;
  };

  // Función para obtener información del símbolo
  const fetchSymbolInfo = async (symbol: string) => {
    setLoadingSymbolInfo(true);
    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const response = await fetch(
        `${BACKEND_URL}/api/binance/symbol-info-public/${symbol}`
      );
      const result = await response.json();

      if (result.success) {
        const { stepSize, minQty } = result.symbolInfo;
        setStepSize(stepSize || 0.00001);
        setMinQty(minQty || 0.00001);
      }
    } catch (error) {
      console.error("Error obteniendo información del símbolo:", error);
    } finally {
      setLoadingSymbolInfo(false);
    }
  };

  // Función para ajustar cantidad al stepSize válido
  const adjustToValidStepSize = (quantity: number, step: number): number => {
    if (step <= 0) return quantity;
    const validMultiple = Math.floor(quantity / step);
    const validQuantity = validMultiple * step;
    
    const stepDecimals = step.toString().includes('.') 
      ? step.toString().split('.')[1].length 
      : 0;
    
    return parseFloat(validQuantity.toFixed(stepDecimals));
  };

  // Validación completa de la cantidad
  const validateQuantity = (value: string): { isValid: boolean; error?: string; adjusted?: number } => {
    if (!value) {
      return { 
        isValid: false, 
        error: "Debe ingresar una cantidad" 
      };
    }
    
    const quantityNum = parseFloat(value);
    
    if (isNaN(quantityNum)) {
      return { 
        isValid: false, 
        error: "Debe ingresar un número válido" 
      };
    }
    
    if (quantityNum <= 0) {
      return { 
        isValid: false, 
        error: "La cantidad debe ser mayor a 0" 
      };
    }
    
    if (quantityNum < minQty) {
      const adjusted = minQty;
      return { 
        isValid: false, 
        error: `La cantidad mínima es ${minQty}. Se ajustará a: ${adjusted}`,
        adjusted
      };
    }
    
    if (compra) {
      const cantidadDisponible = compra.cantidadRestante || compra.cantidad;
      if (quantityNum > cantidadDisponible) {
        const adjusted = adjustToValidStepSize(cantidadDisponible, stepSize);
        return { 
          isValid: false, 
          error: `Máximo disponible: ${cantidadDisponible}. Se ajustará a: ${adjusted}`,
          adjusted
        };
      }
    }
    
    const remainder = quantityNum % stepSize;
    const tolerance = 0.000000001;
    const isValidMultiple = 
      remainder < tolerance || 
      Math.abs(remainder - stepSize) < tolerance;
    
    if (!isValidMultiple && stepSize > 0) {
      const adjusted = adjustToValidStepSize(quantityNum, stepSize);
      return { 
        isValid: false, 
        error: `Debe ser múltiplo de ${stepSize}. Se ajustará a: ${adjusted}`,
        adjusted
      };
    }
    
    return { isValid: true };
  };

  const handleCantidadChange = (value: string) => {
    setCantidad(value);
    setIsTouched(true);
    // Limpiar error y valor corregido cuando el usuario empieza a escribir
    setValidationError("");
    setValorCorregido(null);
  };

  const handleCantidadBlur = () => {
    if (!cantidad || !isTouched) return;
    
    const validation = validateQuantity(cantidad);
    
    if (!validation.isValid) {
      setValidationError(validation.error || "");
      
      if (validation.adjusted !== undefined) {
        // Guardar el valor corregido pero no aplicarlo automáticamente
        setValorCorregido(validation.adjusted);
      }
    } else {
      setValidationError("");
      setValorCorregido(null);
    }
  };

  const handleUsarMaximo = () => {
    if (!compra) return;
    
    const cantidadDisponible = compra.cantidadRestante || compra.cantidad;
    const cantidadMaximaValida = calcularCantidadMaximaValida(cantidadDisponible);
    
    setCantidad(cantidadMaximaValida.toString());
    setValidationError("");
    setValorCorregido(null);
    setIsTouched(true);
  };

  const aplicarValorCorregido = () => {
    if (valorCorregido !== null) {
      setCantidad(valorCorregido.toString());
      setValidationError("");
      setValorCorregido(null);
    }
  };

  const cantidadDisponible = compra
    ? compra.cantidadRestante || compra.cantidad
    : 0;

  if (!isOpen || !compra) return null;

  // Calcular valor estimado usando el valor actual o el corregido
  const cantidadParaCalcular = valorCorregido !== null ? valorCorregido : parseFloat(cantidad || "0");
  const valorVentaEstimado = cantidadParaCalcular * precioActual;
  const esVentaParcial = cantidadParaCalcular < cantidadDisponible;

  // Calcular comisión y ganancia total
  const comisionMonto = valorVentaEstimado * commissionRate;
  
  // Calcular el costo proporcional de la compra original
  // Si es venta total, usar el total completo, si es parcial, calcular proporción
  let costoCompraProporcional = 0;
  
  if (compra.total !== undefined) {
    // Si tenemos el campo total, calcular proporción
    const proporcion = cantidadParaCalcular / compra.cantidad;
    costoCompraProporcional = compra.total * proporcion;
  } else {
    // Si no tenemos el campo total, calcularlo a partir de precio y cantidad
    costoCompraProporcional = cantidadParaCalcular * compra.precio;
  }
  
  // Calcular ganancia/beneficio total (valor de venta - comisión - costo de compra)
  const beneficioTotal = valorVentaEstimado - comisionMonto - compra.total;
  
  // Calcular porcentaje de ganancia
  const porcentajeGanancia = costoCompraProporcional > 0 
    ?  (beneficioTotal * 100) / valorVentaEstimado
    : 0;

  // Determinar asset de comisión basado en el símbolo
  const determinarCommissionAsset = (symbol: string): string => {
    if (symbol.includes("USDC")) return "USDC";
    if (symbol.includes("USDT")) return "USDT";
    return "USDC"; // Por defecto
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let cantidadFinal: number;
    const precioLimiteNum = precioLimite ? parseFloat(precioLimite) : undefined;
    const quoteQuantityNum = quoteQuantity ? parseFloat(quoteQuantity) : undefined;

    // Si hay un valor corregido disponible, usarlo
    if (valorCorregido !== null) {
      cantidadFinal = valorCorregido;
      // Actualizar el campo con el valor corregido
      setCantidad(valorCorregido.toString());
      setValidationError("");
      setValorCorregido(null);
    } else {
      // Validar la cantidad actual
      const validation = validateQuantity(cantidad);
      
      if (!validation.isValid) {
        // Si no es válida y hay un valor ajustado, usarlo
        if (validation.adjusted !== undefined) {
          cantidadFinal = validation.adjusted;
          setCantidad(validation.adjusted.toString());
          setValidationError("");
          setValorCorregido(null);
        } else {
          // Si no hay valor ajustado, mostrar error y no proceder
          setValidationError(validation.error || "Error de validación");
          return;
        }
      } else {
        // Si es válida, usar la cantidad actual
        cantidadFinal = parseFloat(cantidad);
      }
    }

    // Validaciones finales
    if (cantidadFinal <= 0) {
      setValidationError("La cantidad debe ser mayor que 0");
      return;
    }

    if (cantidadFinal > cantidadDisponible) {
      setValidationError(`La cantidad no puede superar ${cantidadDisponible}`);
      return;
    }

    // Limpiar error antes de enviar
    setValidationError("");
    
    onConfirmar({
      cantidad: cantidadFinal,
      tipoOrden,
      precioLimite: precioLimiteNum,
      quoteQuantity: quoteQuantityNum,
    });
  };

  // Obtener el símbolo base para mostrar
  const baseAsset = compra.simbolo.replace("USDC", "").replace("USDT", "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--card-bg)] rounded-lg shadow-xl w-full max-w-md mx-4 border border-[var(--card-border)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Vender {compra.simbolo}
            </h2>
            {loadingSymbolInfo ? (
              <p className="text-xs text-gray-500 mt-1">
                Cargando reglas del símbolo...
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Mínimo: {minQty} | Incremento: {stepSize}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-[var(--surface)] transition-colors"
          >
            <IconoCerrar className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Información de la compra */}
          <div className="p-3 bg-[var(--surface)] rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Disponible:
              </span>
              <span className="font-medium">
                {cantidadDisponible.toFixed(8)} {baseAsset}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Precio compra:
              </span>
              <span className="font-medium">${compra.precio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Costo compra:
              </span>
              <span className="font-medium">${compra.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Precio actual:
              </span>
              <span className="font-medium">${precioActual.toFixed(2)}</span>
            </div>
          </div>

          {/* Cantidad a vender */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-[var(--foreground-secondary)]">
                Cantidad a vender
              </label>
              <div className="flex gap-1">
                <span className="text-xs text-gray-500">
                  Múltiplo de: {stepSize}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                step={stepSize || "any"}
                value={cantidad}
                onChange={(e) => handleCantidadChange(e.target.value)}
                onBlur={handleCantidadBlur}
                className={`flex-1 p-2 border rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] ${
                  validationError ? "border-red-500" : "border-[var(--card-border)]"
                }`}
                placeholder={`Mínimo: ${minQty}`}
                min={minQty}
                max={cantidadDisponible}
                required
              />
              <button
                type="button"
                onClick={handleUsarMaximo}
                className="px-3 py-2 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-lg transition-colors whitespace-nowrap"
              >
                Máx Válido
              </button>
            </div>
            
            <div className="mt-1 text-xs text-[var(--foreground-secondary)] flex justify-between">
              <span>
                {esVentaParcial ? "Venta parcial" : "Venta total"}
              </span>
              {cantidad && !validationError && (
                <span className="text-green-500">
                  ✓ Cantidad válida
                </span>
              )}
            </div>
            
            {validationError && (
              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-red-500 mt-0.5">⚠</div>
                  <div>
                    <p className="text-sm text-red-500 font-medium">{validationError}</p>
                    <p className="text-xs text-red-400 mt-1">
                      {valorCorregido !== null ? (
                        <button
                          type="button"
                          onClick={aplicarValorCorregido}
                          className="underline hover:text-red-300"
                        >
                          Haz clic aquí para aplicar el valor corregido ({valorCorregido})
                        </button>
                      ) : (
                        "El valor se ajustará automáticamente al confirmar"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Valor estimado, comisión y ganancia total */}
          <div className="p-3 bg-[var(--surface)] rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Valor estimado:
              </span>
              <span className="font-medium">
                {valorVentaEstimado.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-[var(--card-border)]">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Comisión ({(commissionRate * 100).toFixed(2)}%):
              </span>
              <span className="font-medium text-red-500">
                -{comisionMonto.toFixed(2)} {determinarCommissionAsset(compra.simbolo)}
              </span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-[var(--card-border)]">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Costo de compra:
              </span>
              <span className="font-medium text-amber-500">
                -{compra.total?.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between pt-2 border-t border-[var(--card-border)]">
              <span className="text-sm text-[var(--foreground-secondary)]">
                Beneficio total:
              </span>
              <span className={`font-medium ${beneficioTotal >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {beneficioTotal.toFixed(2)} {beneficioTotal !== 0 && `(${porcentajeGanancia.toFixed(2)}%)`}
              </span>
            </div>
            
            {cantidad && !validationError && (
              <div className="mt-2 text-xs text-green-500">
                ✓ La orden será ejecutada correctamente en Binance
              </div>
            )}
            {validationError && valorCorregido !== null && (
              <div className="mt-2 text-xs text-yellow-500">
                ⚠ Al confirmar, se usará el valor corregido: {valorCorregido}
              </div>
            )}
          </div>

          {/* Tipo de orden */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-2">
              Tipo de orden
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoOrden("MARKET")}
                className={`flex-1 py-2 px-3 rounded-lg transition-colors ${tipoOrden === "MARKET" ? "bg-blue-500 text-white" : "bg-[var(--surface)] text-[var(--foreground)]"}`}
              >
                Mercado
              </button>
              <button
                type="button"
                onClick={() => setTipoOrden("LIMIT")}
                className={`flex-1 py-2 px-3 rounded-lg transition-colors ${tipoOrden === "LIMIT" ? "bg-blue-500 text-white" : "bg-[var(--surface)] text-[var(--foreground)]"}`}
              >
                Límite
              </button>
            </div>
          </div>

          {tipoOrden === "LIMIT" && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
                Precio límite
              </label>
              <input
                type="number"
                step="any"
                value={precioLimite}
                onChange={(e) => setPrecioLimite(e.target.value)}
                className="w-full p-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)]"
                placeholder="Ej: 1.25"
                required={tipoOrden === "LIMIT"}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground-secondary)] mb-1">
              Monto fijo a obtener (opcional)
            </label>
            <input
              type="number"
              step="any"
              value={quoteQuantity}
              onChange={(e) => setQuoteQuantity(e.target.value)}
              className="w-full p-2 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)] text-[var(--foreground)]"
              placeholder={`Ej: 1000 (${determinarCommissionAsset(compra.simbolo)})`}
            />
            <div className="mt-1 text-xs text-[var(--foreground-secondary)] flex items-center gap-1">
              <IconoInfo className="w-3 h-3" />
              Dejar vacío para vender por cantidad del activo
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--card-border)]">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 rounded-lg border border-[var(--card-border)] hover:bg-[var(--surface)] transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !cantidad}
            >
              {isLoading ? "Procesando..." : "Confirmar Venta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalVenta;