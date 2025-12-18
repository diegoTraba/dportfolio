// components/controles/BeneficioDisplay.tsx
import { IconoTrendingUp, IconoTrendingDown } from "@/components/controles/Iconos";

interface BeneficioDisplayProps {
  beneficio: number;
  porcentajeBeneficio: number;
  tamaño?: "sm" | "md" | "lg";
  alineación?: "left" | "center" | "right";
}

const BeneficioDisplay = ({
  beneficio,
  porcentajeBeneficio,
  tamaño = "md",
  alineación = "right",
}: BeneficioDisplayProps) => {
  const isPositive = beneficio >= 0;
  const tamañoIcono = tamaño === "sm" ? "w-2 h-2" : tamaño === "lg" ? "w-4 h-4" : "w-3 h-3";
  const tamañoTexto = tamaño === "sm" ? "text-xs" : tamaño === "lg" ? "text-base" : "text-sm";
  
  const alineaciónClase = {
    left: "items-start",
    center: "items-center",
    right: "items-end"
  }[alineación];

  return (
    <div
      className={`flex flex-col ${alineaciónClase} ${
        isPositive ? "text-green-500" : "text-red-500"
      }`}
    >
      <div className="flex items-center gap-1">
        {isPositive ? (
          <IconoTrendingUp className={tamañoIcono} />
        ) : (
          <IconoTrendingDown className={tamañoIcono} />
        )}
        <span className={`font-semibold ${tamañoTexto}`}>
          ${beneficio.toFixed(2)}
        </span>
      </div>
      <div
        className={`${tamañoTexto.replace('text-', 'text-')} ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        ({porcentajeBeneficio >= 0 ? "+" : ""}
        {porcentajeBeneficio.toFixed(2)}%)
      </div>
    </div>
  );
};

export default BeneficioDisplay;