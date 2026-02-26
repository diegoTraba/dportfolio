"use client";

import { IconoRefrescar } from "./Iconos";
import FiltroFecha from "./FiltroFecha";
import { SIMBOLOS_SOPORTADOS } from "@/lib/constantes";

interface FiltrosOperacionesProps {
  fechaInicio: Date | null;
  setFechaInicio: (fecha: Date | null) => void;
  fechaFin: Date | null;
  setFechaFin: (fecha: Date | null) => void;
  simboloSeleccionado: string;
  setSimboloSeleccionado: (simbolo: string) => void;
  handleLimpiarFiltros: () => void;
  totalItems: number;
  itemsFiltrados: number;
  mostrarFiltros: boolean;
  labelFechaInicio?: string;
  labelFechaFin?: string;
  className?: string;
}

export default function FiltrosOperaciones({
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  simboloSeleccionado,
  setSimboloSeleccionado,
  handleLimpiarFiltros,
  totalItems,
  itemsFiltrados,
  mostrarFiltros,
  labelFechaInicio = "Fecha de inicio",
  labelFechaFin = "Fecha de fin",
  className = "",
}: FiltrosOperacionesProps) {
  const simbolosDisponibles: string[] = [...SIMBOLOS_SOPORTADOS];
  const porcentajeFiltrado = totalItems > 0 ? Math.round((itemsFiltrados / totalItems) * 100) : 0;

  return (
    <div className={`mb-8 p-4 bg-custom-card border border-custom-card rounded-lg ${className}`}>
      <h2 className="text-lg title-custom-foreground mb-4">Filtros</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <FiltroFecha
            label={labelFechaInicio}
            placeholder="Desde"
            value={fechaInicio}
            onChange={setFechaInicio}
            maxDate={fechaFin ? fechaFin : undefined}
          />
        </div>

        <div>
          <FiltroFecha
            label={labelFechaFin}
            placeholder="Hasta"
            value={fechaFin}
            onChange={setFechaFin}
            minDate={fechaInicio || undefined}
            maxDate={new Date()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-custom-foreground">
            Símbolo
          </label>
          <select
            value={simboloSeleccionado}
            onChange={(e) => setSimboloSeleccionado(e.target.value)}
            className="w-full px-4 py-3 bg-custom-surface border border-custom-border rounded-lg text-custom-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los símbolos</option>
            {simbolosDisponibles.map((simbolo) => (
              <option key={simbolo} value={simbolo}>
                {simbolo}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={handleLimpiarFiltros}
            className="flex items-center justify-center gap-2 px-4 py-3 w-full bg-custom-surface hover:bg-custom-header rounded-lg transition-colors text-custom-foreground border border-custom-border"
          >
            <IconoRefrescar className="w-4 h-4" />
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Información de filtrado */}
      {mostrarFiltros && (
        <div className="mt-4 p-3 bg-alerta-activa border border-alerta-activa rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="text-sm text-custom-foreground">
                Mostrando operaciones
                {fechaInicio && fechaFin
                  ? ` del ${fechaInicio.toLocaleDateString("es-ES")} al ${fechaFin.toLocaleDateString("es-ES")}`
                  : fechaInicio
                  ? ` desde el ${fechaInicio.toLocaleDateString("es-ES")}`
                  : fechaFin
                  ? ` hasta el ${fechaFin?.toLocaleDateString("es-ES")}`
                  : ""}
                {simboloSeleccionado && (
                  <span>
                    {fechaInicio || fechaFin ? " y " : " "}
                    con símbolo: <strong>{simboloSeleccionado}</strong>
                  </span>
                )}
              </p>
            </div>
            <div className="text-sm text-custom-foreground">
              <span className="font-semibold">{itemsFiltrados}</span> de {totalItems} operaciones ({porcentajeFiltrado}%)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}