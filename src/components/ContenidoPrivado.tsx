//Control para evitar que los usuarios no logueados no puedan acceder a paginas privadas
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ContenidoPrivado({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [estaAutenticado, setEstaAutenticado] = useState<boolean | null>(null)

  // Función para decodificar el token JWT y obtener la expiración
  const getTokenRemainingMinutes = (token: string): number => {
    if (!token) return 0;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      if (!decoded.exp) return 0;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const timeLeftInSeconds = decoded.exp - currentTime;
      const timeLeftInMinutes = Math.floor(timeLeftInSeconds / 60);
      
      return timeLeftInMinutes;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return 0;
    }
  };

  useEffect(() => {
    // Verificar si el usuario está logueado Y tiene un token válido
    const checkAuth = () => {
      const logueado = localStorage.getItem('estaLogueado')
      const token = localStorage.getItem('authToken')
      
      // 1. Verificar si está marcado como logueado y tiene token
      if (logueado !== 'true' || !token) {
        console.log('❌ No está logueado o no tiene token')
        setEstaAutenticado(false)
        router.push('/')
        return
      }
      
      // 2. Verificar si el token ha expirado
      const remainingMinutes = getTokenRemainingMinutes(token)
      console.log(`⏰ Minutos restantes en el token: ${remainingMinutes}`)
      
      if (remainingMinutes <= 0) {
        console.log('🚫 Token expirado, cerrando sesión...')
        // Limpiar localStorage
        localStorage.removeItem('estaLogueado')
        localStorage.removeItem('authToken')
        localStorage.removeItem('correoUsuario')
        localStorage.removeItem('idUsuario')
        localStorage.removeItem('nombreUsuario')
        localStorage.removeItem('ultimoAcceso')
        
        setEstaAutenticado(false)
        router.push('/')
        return
      }
      
      // 3. Todo correcto, usuario autenticado
      setEstaAutenticado(true)
    }

    checkAuth()
  }, [router])

  // Mostrar loading mientras verifica
  if (estaAutenticado === null) {
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
  if (estaAutenticado) {
    return <>{children}</>
  }

  // Redirigir (ya se hace en el useEffect)
  return null
}