'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Inicializar directamente con el valor de localStorage
  const [userEmail, setUserEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail') || ''
    }
    return ''
  })

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    // Eliminar sesión del localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userId')
    
    // Actualizar el estado
    setUserEmail('')
    
    // Redirigir al login
    router.push('/')
  }

  const baseStyle = "px-3 py-2 rounded-md transition-colors"
  const activeStyle = "bg-blue-600 text-white"
  const inactiveStyle = "bg-gray-700 text-gray-300 hover:bg-gray-600"

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
        <div className="flex justify-center mb-6">
          <Image 
            src="/img/logo_DPortfolio.png" 
            alt="DPortfolio" 
            width={50} 
            height={50}
            className="h-8 w-auto" // Ajusta la altura, el ancho se auto-ajusta
            priority // Para que cargue rápido en la página principal
          />
        </div>
          {userEmail && (
            <p className="text-sm text-gray-400">Hola, {userEmail}</p>
          )}
        </div>
        <nav className="flex space-x-2 items-center">
          <Link 
            href="/inicio" 
            className={`${baseStyle} ${
              isActive('/inicio') ? activeStyle : inactiveStyle
            }`}
          >
            Portfolio
          </Link>
          <Link 
            href="/alertas" 
            className={`${baseStyle} ${
              isActive('/alertas') ? activeStyle : inactiveStyle
            }`}
          >
            Alertas
          </Link>
          <Link 
            href="/configuracion" 
            className={`${baseStyle} ${
              isActive('/configuracion') ? activeStyle : inactiveStyle
            }`}
          >
            Configuración
          </Link>
          <button 
            onClick={handleLogout}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>
  )
}