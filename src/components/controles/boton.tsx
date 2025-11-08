// components/controles/Boton.tsx
'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface BotonPersonalizadoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  texto: string | ReactNode
  colorFondo?: string
  colorHover?: string
  colorTexto?: string
  colorFondoDisabled?: string
  colorTextoDisabled?: string
  tamaño?: 'pequeno' | 'mediano' | 'grande'
  variante?: 'primario' | 'secundario' | 'acento'
  loading?: boolean
}

export default function BotonPersonalizado({
  texto,
  colorFondo,
  colorHover,
  colorTexto = 'white',
  colorFondoDisabled,
  colorTextoDisabled,
  tamaño = 'mediano',
  variante = 'primario',
  loading = false,
  disabled,
  className = '',
  ...props
}: BotonPersonalizadoProps) {
  
  // Colores por defecto según la variante (en RGB)
  const coloresPorDefecto = {
    primario: {
      fondo: 'rgb(45, 121, 183)',
      hover: 'rgb(37, 105, 165)',
      fondoDisabled: 'rgb(156, 163, 175)',
      textoDisabled: 'rgb(107, 114, 128)'
    },
    secundario: {
      fondo: 'rgb(47, 54, 138)',
      hover: 'rgb(37, 43, 111)',
      fondoDisabled: 'rgb(156, 163, 175)',
      textoDisabled: 'rgb(107, 114, 128)'
    },
    acento: {
      fondo: 'rgb(18, 179, 148)',
      hover: 'rgb(15, 156, 127)',
      fondoDisabled: 'rgb(156, 163, 175)',
      textoDisabled: 'rgb(107, 114, 128)'
    }
  }

  // Tamaños predefinidos
  const tamaños = {
    pequeno: 'px-3 py-1 text-sm',
    mediano: 'px-4 py-2 text-base',
    grande: 'px-6 py-3 text-lg'
  }

  const isDisabled = disabled || loading

  // Determinar colores según el estado
  const fondo = isDisabled 
    ? colorFondoDisabled || coloresPorDefecto[variante].fondoDisabled
    : colorFondo || coloresPorDefecto[variante].fondo

  const textoColor = isDisabled
    ? colorTextoDisabled || coloresPorDefecto[variante].textoDisabled
    : colorTexto

  const hoverColor = colorHover || coloresPorDefecto[variante].hover

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        rounded-md font-semibold transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        flex items-center justify-center
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
  )
}