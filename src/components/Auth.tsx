'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CampoContrasenia from '@/components/controles/CampoContrasenia'
import Aviso from '@/components/controles/Aviso'
import Boton from '@/components/controles/Boton'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      // ✅ GUARDAR TOKEN Y DATOS DE USUARIO EN LOCALSTORAGE
      localStorage.setItem('authToken', data.token)
      localStorage.setItem('estaLogueado', 'true')
      localStorage.setItem('correoUsuario', data.user.email)
      localStorage.setItem('idUsuario', data.user.id)
      localStorage.setItem('nombreUsuario', data.user.name)

      console.log('✅ Login exitoso, token guardado:', data.user.name)

      // Login exitoso - redirigir al dashboard
      router.push('/inicio')
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError('Error al iniciar sesión: ' + err.message)
      } else {
        setError('Error al iniciar sesión: Error desconocido')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <Aviso 
          tipo="error"
          mensaje={error}
        />
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2 text-custom-foreground">
          Email
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-custom-background border border-custom-card rounded-md text-custom-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-custom-foreground">
          Contraseña
        </label>
        <CampoContrasenia
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
        />
      </div>
      
      <Boton
        type="submit"
        texto={loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        loading={loading}
        disabled={loading}
        tamaño="grande"
        variante="primario"
        className="w-full"
      />
    </form>
  )
}