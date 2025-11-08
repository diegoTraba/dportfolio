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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const { data: user, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (queryError || !user) {
        setError('Email o contraseña incorrectos')
        return
      }

      // Verificar contraseña con bcrypt
      const bcrypt = await import('bcryptjs')
      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        setError('Email o contraseña incorrectos')
        return
      }

      // ✅ GUARDAR SESIÓN EN LOCALSTORAGE
      localStorage.setItem('estaLogueado', 'true')
      localStorage.setItem('correoUsuario', email)
      localStorage.setItem('idUsuario', user.id)
      localStorage.setItem('nombreUsuario', user.name)

      // Login exitoso - redirigir al dashboard
      router.push('/inicio')
      
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        const error = err as { message: string }
        setError('Error al iniciar sesion: ' + error.message)
      } else {
        setError('Error al iniciar sesion: Error desconocido')
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