//Control para evitar que los usuarios no logueados no puedan acceder a paginas privadas
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // Verificar si el usuario está logueado
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn')
      
      if (loggedIn === 'true') {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  // Mostrar loading mientras verifica
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado, mostrar el contenido
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Redirigir (ya se hace en el useEffect)
  return null
}