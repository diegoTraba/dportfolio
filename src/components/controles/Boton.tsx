// components/controles/Boton.tsx
"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface BotonPersonalizadoProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  texto: string | ReactNode;
  colorFondo?: string;
  colorHover?: string;
  colorTexto?: string;
  colorFondoDisabled?: string;
  colorTextoDisabled?: string;
  tamaño?: "pequeno" | "mediano" | "grande";
  loading?: boolean;
  bold?: boolean; // Nuevo parámetro
}

export default function BotonPersonalizado({
  texto,
  colorFondo,
  colorHover,
  colorTexto = "white",
  colorFondoDisabled,
  colorTextoDisabled,
  tamaño = "mediano",
  loading = false,
  bold = false, // Valor por defecto: false
  disabled,
  className = "",
  ...props
}: BotonPersonalizadoProps) {
  // Tamaños predefinidos
  const tamaños = {
    pequeno: "px-3 py-1 text-sm",
    mediano: "px-4 py-2 text-base",
    grande: "px-6 py-3 text-lg",
  };

  const isDisabled = disabled || loading;

  // Valores por defecto
  const fondoDefault = "var(--colorPrimario)";
  const hoverDefault = "var(--custom-accent-hover)";
  const fondoDisabledDefault = "rgb(156, 163, 175)";
  const textoDisabledDefault = "rgb(107, 114, 128)";

  const fondo = isDisabled
    ? colorFondoDisabled || fondoDisabledDefault
    : colorFondo || fondoDefault;

  const textoColor = isDisabled
    ? colorTextoDisabled || textoDisabledDefault
    : colorTexto;

  const hoverColor = colorHover || hoverDefault;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        rounded-md transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        flex items-center justify-center
        ${bold ? 'font-semibold' : ''}
        ${tamaños[tamaño]}
        ${isDisabled ? 'cursor-not-allowed' : 'hover:brightness-110'}
        ${className}
      `}
      style={{
        backgroundColor: fondo,
        color: textoColor,
      }}
      // Efecto hover solo si no está deshabilitado
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = fondo;
        }
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      ) : (
        texto
      )}
    </button>
  );
}
