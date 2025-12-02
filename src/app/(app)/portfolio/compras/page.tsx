"use client";

import { useState, useEffect } from "react";
import { useUserId } from "@/hooks/useUserId";
import TablaCompras from "@/components/controles/tablas/TablaCompras";

//interfaces
import {ApiResponse,Compra} from "@/interfaces/comun.types"

export default function Compras() {
  const userId = useUserId();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompras, setTotalCompras] = useState(0);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchCompras = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${BACKEND_URL}/api/binance/compras-activas/${userId}?limit=100`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error ${response.status}: ${errorText || response.statusText}`
          );
        }

        const data: ApiResponse = await response.json();

        // Validar que la respuesta fue exitosa
        if (!data.success) {
          throw new Error("La API no devolvió una respuesta exitosa");
        }

        // Validar que compras es un array
        if (!Array.isArray(data.compras)) {
          throw new Error("Formato de trades inválido");
        }

        // Transformar los trades de la API al formato que espera TablaCompras
        const comprasTransformadas: Compra[] = data.compras.map((compra) => ({
          id: compra.id,
          exchange: compra.exchange,
          idOrden: compra.idOrden,
          simbolo: compra.simbolo,
          precio: compra.precio,
          cantidad: compra.cantidad,
          total: compra.total,
          comision: compra.comision,
          fechaCompra: new Date(compra.fechaCompra).toLocaleDateString("es-ES"),
          vendida: compra.vendida
        }));

        setCompras(comprasTransformadas);
        setTotalCompras(data.compras.length);
      } catch (err) {
        console.error("Error fetching compras:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar las compras"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompras();
  }, [userId]);

  return (
    <>
      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Mis Operaciones</h1>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            <span>Cargando operaciones...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-4 text-sm underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && compras.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron operaciones
          </div>
        )}

        {!loading && !error && compras.length > 0 && (
          <>
            <TablaCompras compras={compras} />
          </>
        )}
      </main>
    </>
  );
}
