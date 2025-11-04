'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function MenuPrincipal() {
  const rutaActual = usePathname()
  const navegador = useRouter()
  
  // Inicializar el nombre del usuario directamente en useState
  const [nombreUsuario, setNombreUsuario] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('nombreUsuario') || ''
    }
    return ''
  })

  const [esMovil, setEsMovil] = useState(false)

  // Efecto para detectar si estamos en un dispositivo móvil
  useEffect(() => {
    const verificarMovil = () => {
      setEsMovil(window.innerWidth < 768)
    }
    
    // Verificar inicialmente
    verificarMovil()
    
    // Configurar event listener para cambios de tamaño
    window.addEventListener('resize', verificarMovil)
    
    return () => window.removeEventListener('resize', verificarMovil)
  }, [])

  /**
   * Verifica si la ruta actual coincide con la ruta proporcionada
   * @param {string} ruta - La ruta a verificar
   * @returns {boolean} True si la ruta está activa
   */
  const estaActiva = (ruta: string) => {
    return rutaActual === ruta
  }

  /**
   * Maneja el cierre de sesión del usuario
   * Limpia localStorage y redirige al login
   */
  const manejarCerrarSesion = () => {
    // Limpiar todos los datos de sesión
    localStorage.removeItem('estaLogueado')
    localStorage.removeItem('emailUsuario')
    localStorage.removeItem('idUsuario')
    localStorage.removeItem('nombreUsuario')
    
    // Actualizar el estado local
    setNombreUsuario('')
    
    // Redirigir a la página de login
    navegador.push('/')
  }

  // Estilos base para los enlaces de navegación
  const estiloBase = "px-3 py-2 rounded-md transition-colors flex items-center justify-center"
  const estiloActivo = "bg-blue-600 text-white"
  const estiloInactivo = "bg-gray-700 text-gray-300 hover:bg-gray-600"

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      {/* Diseño para PC - Una sola fila */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo y mensaje de bienvenida a la izquierda */}
          <div className="flex items-center space-x-4">
            {/* Logo más grande para PC */}
            <Image 
              src="/img/logo_DPortfolio.png" 
              alt="DPortfolio" 
              width={50} 
              height={50}
              className="h-10 w-auto"
              priority
            />
            {/* Mensaje de bienvenida siempre visible en PC */}
            {nombreUsuario && (
              <p className="text-sm text-gray-300">
                Hola, <span className="font-medium text-white">{nombreUsuario}</span>
              </p>
            )}
          </div>

          {/* Navegación central en PC */}
          <nav className="flex space-x-2 items-center">
            <Link 
              href="/inicio" 
              className={`${estiloBase} ${
                estaActiva('/inicio') ? estiloActivo : estiloInactivo
              }`}
            >
              Portfolio
            </Link>
            
            <Link 
              href="/alertas" 
              className={`${estiloBase} ${
                estaActiva('/alertas') ? estiloActivo : estiloInactivo
              }`}
            >
              Alertas
            </Link>
          </nav>

          {/* Botones de acción a la derecha en PC */}
          <div className="flex items-center space-x-2">
            {/* Botón de configuración */}
            <Link 
              href="/configuracion" 
              className={`p-3 rounded-md transition-colors ${
                estaActiva('/configuracion') 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Configuración"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* Botón de cerrar sesión */}
            <button 
              onClick={manejarCerrarSesion}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-md transition-colors text-white"
              title="Cerrar sesión"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Diseño para Móvil - Dos filas */}
      <div className="md:hidden">
        {/* Primera fila móvil: Logo y botones de acción */}
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo en móvil */}
          <div className="flex items-center">
            <Image 
              src="/img/logo_DPortfolio.png" 
              alt="DPortfolio" 
              width={40} 
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>
          
          {/* Botones de acción en móvil */}
          <div className="flex items-center space-x-2">
            {/* Mensaje de bienvenida reducido en móvil */}
            {nombreUsuario && (
              <p className="text-xs text-gray-300 mr-2">
                Hola, <span className="font-medium">{nombreUsuario.split(' ')[0]}</span>
              </p>
            )}
            
            <Link 
              href="/configuracion" 
              className={`p-2 rounded-md transition-colors ${
                estaActiva('/configuracion') 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title="Configuración"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <button 
              onClick={manejarCerrarSesion}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors text-white"
              title="Cerrar sesión"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Segunda fila móvil: Navegación principal */}
        <div className="container mx-auto px-4 pb-2">
          <nav className="flex space-x-1 justify-center">
            <Link 
              href="/inicio" 
              className={`${estiloBase} ${
                estaActiva('/inicio') ? estiloActivo : estiloInactivo
              } text-sm px-2 py-1`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Portfolio
            </Link>
            
            <Link 
              href="/alertas" 
              className={`${estiloBase} ${
                estaActiva('/alertas') ? estiloActivo : estiloInactivo
              } text-sm px-2 py-1`}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Alertas
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}