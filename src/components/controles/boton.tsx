'use client'

import { ButtonHTMLAttributes } from 'react'

interface BotonPersonalizadoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  texto: string
  colorFondo?: string
  colorHover?: string
  colorTexto?: string
  tamaño?: 'pequeno' | 'mediano' | 'grande'
  variante?: 'primario' | 'secundario' | 'acento'
  loading?: boolean
}

export default function BotonPersonalizado({
  texto,
  colorFondo,
  colorHover,
  colorTexto = 'white',
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
      fondo: 'rgb(45, 121, 183)',    // #2e78b7
      hover: 'rgb(37, 105, 165)'     // #2569a5
    },
    secundario: {
      fondo: 'rgb(47, 54, 138)',     // #2e3687
      hover: 'rgb(37, 43, 111)'      // #252e6f
    },
    acento: {
      fondo: 'rgb(18, 179, 148)',    // #12b394
      hover: 'rgb(15, 156, 127)'     // #0f9c7f
    }
  }

  // Tamaños predefinidos
  const tamaños = {
    pequeno: 'px-3 py-1 text-sm',
    mediano: 'px-4 py-2 text-base',
    grande: 'px-6 py-3 text-lg'
  }

  const fondo = colorFondo || coloresPorDefecto[variante].fondo
  const hover = colorHover || coloresPorDefecto[variante].hover

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        rounded-md font-semibold transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${tamaños[tamaño]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{
        backgroundColor: fondo,
        color: colorTexto,
      }}
      // Añadimos un efecto hover personalizado
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.backgroundColor = hover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
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