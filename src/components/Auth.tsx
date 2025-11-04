'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CampoContrasenia from '@/components/CampoContrasenia'
import Aviso from '@/components/Aviso'

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
      localStorage.setItem('emailUsuario', user.id)
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
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <CampoContrasenia
            value={password}
            onChange={setPassword}
            placeholder="Contraseña"
          />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md font-semibold disabled:opacity-50"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  )
}