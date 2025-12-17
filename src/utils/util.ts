import { Compra } from "@/interfaces/comun.types";

export const calcularCambio = (compra: Compra, precioActual?: number) => {
  if (!precioActual || compra.vendida) return null;

  const cantidad = compra.cantidadRestante || compra.cantidad;
  const totalActual = precioActual * cantidad;
  const cambio = totalActual - compra.total;
  const porcentaje = (cambio / compra.total) * 100;

  return {
    valor: cambio,
    porcentaje: porcentaje,
    totalActual: totalActual,
  };
};