"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
} from "lightweight-charts";

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

interface GraficoTradingProps {
  symbol: string;
  candleData: Candle[];
  signalData?: Signal[];
}

type Marker = {
  time: Time;
  position: "aboveBar" | "belowBar" | "inBar";
  color: string;
  shape: "arrowUp" | "arrowDown" | "circle" | "square";
  text?: string;
};

export default function GraficoTrading({
  symbol,
  candleData,
  signalData = [],
}: GraficoTradingProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#1e1e2f" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "#2b2b3b" },
        horzLines: { color: "#2b2b3b" },
      },
      rightPriceScale: {
        borderColor: "#2b2b3b",
      },
      timeScale: {
        borderColor: "#2b2b3b",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!candlestickSeriesRef.current || candleData.length === 0) return;
  
    candlestickSeriesRef.current.setData(candleData);
  
    const times = candleData.map(d => d.time as number);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
  
    const markers: Marker[] = signalData
      .filter(s => {
        const t = s.time as number;
        return t >= minTime && t <= maxTime;
      })
      .map((signal) => ({
        time: signal.time,
        position: signal.type === "buy" ? "aboveBar" : "belowBar",
        color: signal.type === "buy" ? "#00ff00" : "#ff3333",
        shape: signal.type === "buy" ? "arrowUp" : "arrowDown",
        // text: signal.type === "buy" ? "🟢 COMPRA" : "🔴 VENTA",
      }));
  
    candlestickSeriesRef.current.setMarkers(markers);
  
    // Ajustar vista a las últimas 50 velas
    if (candleData.length > 0) {
      const lastIndex = candleData.length - 1;
      const startIndex = Math.max(0, lastIndex - 49);
      // Usamos directamente el valor, que ya es de tipo Time
      const fromTime = candleData[startIndex].time;
      const toTime = candleData[lastIndex].time;
      chartRef.current?.timeScale().setVisibleRange({
        from: fromTime,
        to: toTime,
      });
    }
  }, [candleData, signalData]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-custom-foreground mb-2">
        {symbol}
      </h2>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}