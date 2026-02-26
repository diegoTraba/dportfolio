// constants/symbols.ts
export const SIMBOLOS_SOPORTADOS = [
    "BTCUSDC",
    "ETHUSDC",
    "SOLUSDC",
    "ADAUSDC",
    "XRPUSDC",
    "BNBUSDC",
    "AVAXUSDC",
    "LINKUSDC",
    "DOGEUSDC",
  ] as const; // 'as const' para que TypeScript infiera tipos literales
  
  // Si también quieres mover los intervalos, puedes hacerlo aquí
  export const OPCIONES_INTERVALOS = ["1m", "3m", "5m", "15m", "1h"] as const;
  
  // Tipo derivado para usar en TypeScript (opcional)
  export type SimbolosSoportados = typeof SIMBOLOS_SOPORTADOS[number];
  export type IntervalosSoportados = typeof OPCIONES_INTERVALOS[number];