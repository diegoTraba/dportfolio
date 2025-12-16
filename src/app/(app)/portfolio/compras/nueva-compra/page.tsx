"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hooks/useUserId";
import Boton from "@/components/controles/Boton";
import {
  IconoVolver,
  IconoInfo,
  IconoGuardar,
} from "@/components/controles/Iconos";

export default function NuevaCompra() {
  const userId = useUserId();
  const navegador = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Estados para los campos del formulario
  const [simbolo, setSimbolo] = useState("");
  const [tipoOrden, setTipoOrden] = useState("MARKET");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [notas, setNotas] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const simbolosDisponibles: string[] = process.env
    .NEXT_PUBLIC_CRIPTOMONEDAS_ALERTAS
    ? JSON.parse(process.env.NEXT_PUBLIC_CRIPTOMONEDAS_ALERTAS)
    : [];

  // Tipos de orden disponibles
  const tiposOrden = [
    { valor: "MARKET", label: "Market (al precio actual)" },
    { valor: "LIMIT", label: "Limit (precio específico)" },
    { valor: "STOP_LOSS", label: "Stop Loss" },
    { valor: "STOP_LOSS_LIMIT", label: "Stop Loss Limit" },
  ];

  // Definir una interfaz para los datos de la orden (agrégalo cerca de los otros tipos)
  interface OrderData {
    symbol: string;
    quantity?: string;
    quoteQuantity?:string
    type: "MARKET" | "LIMIT" | "STOP_LOSS" | "STOP_LOSS_LIMIT";
    price?: string;
  }
  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validaciones básicas
    if (!simbolo) {
      setError("Por favor, selecciona un símbolo");
      return;
    }

    if (!cantidad || parseFloat(cantidad) <= 0) {
      setError("Por favor, ingresa una cantidad válida");
      return;
    }

    if (tipoOrden === "LIMIT" && (!precio || parseFloat(precio) <= 0)) {
      setError("Para órdenes LIMIT debes especificar un precio");
      return;
    }

    try {
      setIsLoading(true);

      // Construir el objeto de la orden con tipo específico
      const orderData: OrderData = {
        symbol: simbolo+"USDC",
        quoteQuantity: cantidad,
        type: tipoOrden as "MARKET" | "LIMIT" | "STOP_LOSS" | "STOP_LOSS_LIMIT",
      };

      if (tipoOrden === "LIMIT" && precio) {
        orderData.price = precio;
      }

      console.log("📤 Enviando orden de compra:", orderData);
      console.log("Cantidad: " + cantidad);
      console.log(`👤 User ID: ${userId}`);

      // Llamar al endpoint de compra segura (con userId)
      const response = await fetch(`${BACKEND_URL}/api/binance/user/${userId}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();
      console.log("📥 Respuesta del servidor:", result);

      if (!response.ok) {
        // Si la respuesta no es ok, lanzar un error con el mensaje del servidor
        throw new Error(result.error || "Error al crear la orden");
      }

      // Si la orden se crea exitosamente
      setSuccessMessage("✅ Orden de compra creada exitosamente");

      // Mostrar mensaje de éxito con detalles
      const orderDetails = result.order || {};
      alert(
        `✅ Orden de compra creada exitosamente\n\n` +
          `Símbolo: ${orderDetails.symbol || simbolo}\n` +
          `Cantidad: ${orderDetails.origQty || cantidad}\n` +
          `ID de Orden: ${orderDetails.orderId || "N/A"}\n` +
          `Estado: ${orderDetails.status || "PENDIENTE"}`
      );

      // Redirigir a la página de compras después de 2 segundos
      setTimeout(() => {
        navegador.push("/portfolio/compras");
      }, 2000);
    } catch (err) {
      console.error("❌ Error al crear la orden:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al procesar la orden. Por favor, intenta nuevamente."
      );

      // Mostrar alerta con el error
      alert(
        `❌ Error: ${err instanceof Error ? err.message : "Error desconocido"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar cambio en tipo de orden
  const handleTipoOrdenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    setTipoOrden(valor);

    // Si no es LIMIT, limpiar el campo de precio
    if (valor !== "LIMIT") {
      setPrecio("");
    }
  };

  // Función para cancelar y volver
  const handleCancelar = () => {
    if (simbolo || cantidad || precio || notas) {
      if (
        window.confirm(
          "¿Seguro que quieres cancelar? Los cambios no se guardarán."
        )
      ) {
        navegador.push("/portfolio/compras");
      }
    } else {
      navegador.push("/portfolio/compras");
    }
  };

  return (
    <>
      <main className="container mx-auto p-4">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl title-custom-foreground">Nueva Compra</h1>
          <Boton
            texto={
              <span className="flex items-center gap-2">
                <IconoVolver />
                Volver a Compras
              </span>
            }
            onClick={handleCancelar}
          />
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Formulario principal */}
          <div className="lg:col-span-2">
            <div className="mb-8 p-6 bg-custom-card border border-custom-card rounded-lg">
              <h2 className="text-lg title-custom-foreground mb-6">
                Detalles de la Orden
              </h2>

              {/* Mensaje de error */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-start">
                    <IconoInfo className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Mensaje de éxito */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <div className="flex items-start">
                    <IconoInfo className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                  <p className="mt-2 text-sm">
                    Redirigiendo a la página de compras...
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Campo Símbolo */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-custom-foreground">
                    Símbolo <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={simbolo}
                    onChange={(e) => setSimbolo(e.target.value)}
                    className="w-full px-4 py-3 bg-custom-surface border border-custom-border rounded-lg text-custom-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Selecciona un símbolo</option>
                    {simbolosDisponibles.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Selecciona el par de trading (ej: BTCUSDT)
                  </p>
                </div>

                {/* Campo Tipo de Orden */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3 text-custom-foreground">
                    Tipo de Orden <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={tipoOrden}
                    onChange={handleTipoOrdenChange}
                    className="w-full px-4 py-3 bg-custom-surface border border-custom-border rounded-lg text-custom-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    {tiposOrden.map((tipo) => (
                      <option key={tipo.valor} value={tipo.valor}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    Market: Ejecución inmediata al precio actual
                    <br />
                    Limit: Orden a un precio específico
                  </p>
                </div>

                {/* Campos Cantidad y Precio en la misma fila */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Campo Cantidad */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-custom-foreground">
                      Cantidad <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        step="any"
                        min="0"
                        placeholder="0.00"
                        className="w-full px-4 py-3 bg-custom-surface border border-custom-border rounded-lg text-custom-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-500">USD</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Cantidad a comprar en la moneda base
                    </p>
                  </div>

                  {/* Campo Precio (solo visible para LIMIT) */}
                  {tipoOrden === "LIMIT" && (
                    <div>
                      <label className="block text-sm font-medium mb-3 text-custom-foreground">
                        Precio Límite <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={precio}
                          onChange={(e) => setPrecio(e.target.value)}
                          step="any"
                          min="0"
                          placeholder="0.00"
                          className="w-full px-4 py-3 bg-custom-surface border border-custom-border rounded-lg text-custom-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required={tipoOrden === "LIMIT"}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500">USD</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Precio máximo por unidad
                      </p>
                    </div>
                  )}
                </div>

                {/* Campo Notas */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-3 text-custom-foreground">
                    Notas (Opcional)
                  </label>
                  <textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Agrega notas sobre esta compra..."
                    rows={3}
                    className="w-full px-4 py-3 bg-custom-surface border border-custom-border rounded-lg text-custom-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Puedes agregar comentarios sobre esta operación
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-custom-border">
                  <Boton
                    type="submit"
                    texto={
                      <span className="flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <IconoGuardar />
                            Crear Orden de Compra
                          </>
                        )}
                      </span>
                    }
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Boton
                    texto="Cancelar"
                    onClick={handleCancelar}
                    disabled={isLoading}
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Columna derecha - Información y resumen */}
          <div className="lg:col-span-1">
            {/* Panel de información */}
            <div className="mb-6 p-6 bg-custom-card border border-custom-card rounded-lg">
              <h3 className="text-lg title-custom-foreground mb-4">
                Información de Compra
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start">
                    <IconoInfo className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Comisiones
                      </h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Las órdenes Market tienen una comisión del 0.1%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start">
                    <IconoInfo className="w-5 h-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                        Tiempo de ejecución
                      </h4>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        Órdenes Market: Inmediato
                        <br />
                        Órdenes Limit: Pendiente hasta que se alcance el precio
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel de resumen (se actualiza con los datos) */}
            <div className="p-6 bg-custom-card border border-custom-card rounded-lg">
              <h3 className="text-lg title-custom-foreground mb-4">
                Resumen de la Orden
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-custom-foreground">Símbolo:</span>
                  <span className="font-medium">
                    {simbolo || "No seleccionado"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-custom-foreground">Tipo:</span>
                  <span className="font-medium">
                    {tipoOrden === "MARKET"
                      ? "Market"
                      : tipoOrden === "LIMIT"
                        ? "Limit"
                        : tipoOrden}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-custom-foreground">Cantidad:</span>
                  <span className="font-medium">
                    {cantidad
                      ? `${parseFloat(cantidad).toLocaleString()} USD`
                      : "-"}
                  </span>
                </div>

                {tipoOrden === "LIMIT" && precio && (
                  <div className="flex justify-between items-center">
                    <span className="text-custom-foreground">
                      Precio Límite:
                    </span>
                    <span className="font-medium">
                      {parseFloat(precio).toLocaleString()} USD
                    </span>
                  </div>
                )}

                {simbolo && cantidad && (
                  <>
                    <div className="pt-3 border-t border-custom-border">
                      <div className="flex justify-between items-center">
                        <span className="text-custom-foreground">
                          Total estimado:
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {cantidad} USD
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Incluye comisión estimada del 0.1%
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Consejos rápidos */}
            <div className="mt-6 p-6 bg-custom-card border border-custom-card rounded-lg">
              <h4 className="font-medium text-custom-foreground mb-3">
                Consejos
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Verifica el símbolo antes de confirmar
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Considera las comisiones en tu cálculo
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Las órdenes Market se ejecutan al mejor precio disponible
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  Revisa el resumen antes de confirmar
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
