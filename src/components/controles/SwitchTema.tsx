'use client'

import { useTema } from '@/hooks/useTema'

export default function SwitchTema() {
  const { tema, alternarTema, esOscuro } = useTema()

  return (
    <button
      onClick={alternarTema}
      className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors bg-white border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      title={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={`Cambiar a modo ${esOscuro ? 'claro' : 'oscuro'}`}
    >
      <span className="sr-only">Cambiar tema</span>
      
      {/* Icono del sol (izquierda) */}
      <svg 
        className={`absolute left-1.5 w-3.5 h-3.5 transition-all duration-300 ${
          esOscuro ? 'text-gray-400 opacity-60' : 'text-yellow-500 opacity-100'
        }`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>

      {/* Icono de la luna (derecha) */}
      <svg 
        className={`absolute right-1.5 w-3.5 h-3.5 transition-all duration-300 ${
          esOscuro ? 'text-blue-500 opacity-100' : 'text-gray-400 opacity-60'
        }`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>

      {/* Thumb/control deslizante con color temático */}
      <span className={`inline-block h-5 w-5 transform rounded-full shadow-lg transition-all duration-300 ${
        esOscuro 
          ? 'translate-x-7 bg-blue-500' 
          : 'translate-x-1 bg-yellow-500'
      }`} />
    </button>
  )
}