"use client";

import { useState, useEffect } from "react";
import { useUserId } from "@/hooks/useUserId";
import GraficoTrading from "@/components/controles/GraficoTrading";
import { SIMBOLOS_SOPORTADOS, OPCIONES_INTERVALOS } from "@/lib/constantes";
import { Time } from "lightweight-charts";

interface Candle {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Signal {
  time: Time;
  type: "buy" | "sell";
  price: number;
}

interface CompraData {
  fechaCompra: string;
  precio: number;
}

interface VentaData {
  fechaVenta: string;
  precio: number;
}

// Interfaz para la respuesta del endpoint de klines (time en milisegundos)
interface KlineResponse {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default function GraficosPage() {
  const userId = useUserId();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [selectedSymbol, setSelectedSymbol] = useState<string>(SIMBOLOS_SOPORTADOS[0]);
  const [selectedInterval, setSelectedInterval] = useState<string>("15m");

  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [cargandoVelas, setCargandoVelas] = useState<boolean>(false);
  const [errorVelas, setErrorVelas] = useState<string | null>(null);

  const [señales, setSeñales] = useState<Signal[]>([]);
  const [cargandoSeñales, setCargandoSeñales] = useState<boolean>(false);
  const [errorSeñales, setErrorSeñales] = useState<string | null>(null);

  // Cargar velas según símbolo e intervalo
  useEffect(() => {
    if (!selectedSymbol) return;

    const fetchVelas = async () => {
      setCargandoVelas(true);
      setErrorVelas(null);
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/usuario/klines?symbol=${selectedSymbol}&interval=${selectedInterval}&limit=100`
        );
        if (!response.ok) throw new Error("Error al cargar velas");
        const data = (await response.json()) as KlineResponse[];

        // Convertir time de milisegundos a segundos
        const convertedData: Candle[] = data.map((item) => ({
          time: Math.floor(item.time / 1000) as Time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        setCandleData(convertedData);
      } catch (error) {
        console.error("Error cargando velas:", error);
        setErrorVelas("No se pudieron cargar los datos de mercado");
        setCandleData([]);
      } finally {
        setCargandoVelas(false);
      }
    };

    fetchVelas();
  }, [selectedSymbol, selectedInterval, BACKEND_URL]);

  // Cargar señales (compras/ventas) del usuario para el símbolo
  useEffect(() => {
    if (!userId || !selectedSymbol) return;

    const fetchSeñales = async () => {
      setCargandoSeñales(true);
      setErrorSeñales(null);
      try {
        const [comprasRes, ventasRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/usuario/${userId}/cargarcompras/${selectedSymbol}`),
          fetch(`${BACKEND_URL}/api/usuario/${userId}/cargarventas/${selectedSymbol}`),
        ]);

        if (!comprasRes.ok || !ventasRes.ok) {
          throw new Error("Error al cargar las operaciones");
        }

        const comprasJson = await comprasRes.json();
        const ventasJson = await ventasRes.json();

        const compras = comprasJson.data as CompraData[];
        const ventas = ventasJson.data as VentaData[];

        const señalesMapeadas: Signal[] = [
          ...compras.map((op) => ({
            time: Math.floor(new Date(op.fechaCompra).getTime() / 1000) as Time,
            type: "buy" as const,
            price: op.precio,
          })),
          ...ventas.map((op) => ({
            time: Math.floor(new Date(op.fechaVenta).getTime() / 1000) as Time,
            type: "sell" as const,
            price: op.precio,
          })),
        ].sort((a, b) => (a.time as number) - (b.time as number));
        
        console.log("Señales obtenidas:", señalesMapeadas); // <-- Depuración
        setSeñales(señalesMapeadas);
      } catch (error) {
        console.error("Error al cargar señales:", error);
        setErrorSeñales("No se pudieron cargar las señales de compra/venta");
        setSeñales([]);
      } finally {
        setCargandoSeñales(false);
      }
    };

    fetchSeñales();
  }, [userId, selectedSymbol, BACKEND_URL]);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl md:text-3xl font-bold title-custom-foreground mb-2">
        Gráficos de Trading
      </h1>
      <p className="text-sm text-custom-foreground/70 mb-6">
        Visualiza los gráficos de los símbolos disponibles con tus operaciones.
      </p>

      {/* Selectores en fila */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div>
          <label
            htmlFor="symbol-select"
            className="block text-sm font-medium text-custom-foreground/70 mb-2"
          >
            Seleccionar símbolo
          </label>
          <select
            id="symbol-select"
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full md:w-64 px-3 py-2 bg-[var(--background)] border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)]"
          >
            {SIMBOLOS_SOPORTADOS.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="interval-select"
            className="block text-sm font-medium text-custom-foreground/70 mb-2"
          >
            Intervalo
          </label>
          <select
            id="interval-select"
            value={selectedInterval}
            onChange={(e) => setSelectedInterval(e.target.value)}
            className="w-full md:w-48 px-3 py-2 bg-[var(--background)] border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--colorTerciario)]"
          >
            {OPCIONES_INTERVALOS.map((int) => (
              <option key={int} value={int}>
                {int}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-surface rounded-lg border border-card-border p-4">
        {cargandoVelas && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--colorTerciario)]"></div>
          </div>
        )}
        {errorVelas && (
          <div className="text-red-500 text-center py-4">{errorVelas}</div>
        )}
        {!cargandoVelas && !errorVelas && (
          <>
            {cargandoSeñales && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[var(--colorTerciario)]"></div>
              </div>
            )}
            {errorSeñales && (
              <div className="text-red-500 text-center py-2">{errorSeñales}</div>
            )}
            <GraficoTrading
              symbol={selectedSymbol}
              candleData={candleData}
              signalData={señales}
            />
          </>
        )}
      </div>
    </main>
  );
}