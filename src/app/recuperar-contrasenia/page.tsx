'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Aviso from '@/components/controles/Aviso'

export default function RecuperarContrasena() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Verificar si el usuario existe
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, name')
        .eq('email', email)
        .single()

      if (userError || !user) {
        setError('El correo electrónico no tiene ningún usuario asociado en el sistema')
        setLoading(false)
        return
      }

      // Generar nueva contraseña
      const nuevaContrasena = generarContrasena()
      
      // Hash de la nueva contraseña
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash(nuevaContrasena, 12)

      // Actualizar contraseña en la BD
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Enviar email con las nuevas credenciales
      const { enviarRecuperarContrasenia } = await import('@/lib/email/accionesEmail')
      await enviarRecuperarContrasenia(user.email, user.name, nuevaContrasena)

      setMessage('Se ha enviado una nueva contraseña a tu correo electrónico')
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/')
      }, 3000)

    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        const error = err as { message: string }
        setError('Error al recuperar la contraseña: ' + error.message)
      } else {
        setError('Error al recuperar la contraseña: Error desconocido')
      }
    } finally {
      setLoading(false)
    }
  }

  // Función para generar contraseña temporal
  const generarContrasena = (): string => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let contrasena = '';
    
    // Asegurar que cumple los requisitos
    contrasena += 'A'; // Mayúscula
    contrasena += 'b'; // Minúscula  
    contrasena += '1'; // Número
    contrasena += '!'; // Símbolo
    
    // Completar hasta 10 caracteres
    for (let i = 4; i < 10; i++) {
      contrasena += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    // Mezclar los caracteres
    return contrasena.split('').sort(() => 0.5 - Math.random()).join('');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image 
            src="/img/logo_DPortfolio.png" 
            alt="DPortfolio" 
            width={150} 
            height={50}
            className="h-12 w-auto"
            priority
          />
        </div>

        <h1 className="text-2xl font-bold mb-6 text-center">Recuperar Contraseña</h1>
        
        {error && (
          <Aviso 
          tipo="error"
          mensaje={error}
          className="mb-4"
        />
        )}

        {message && (
          <Aviso 
          tipo="exito"
          mensaje={message}
          className="mb-4"
        />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
            <p className="text-gray-400 text-sm mt-2">
              Te enviaremos una nueva contraseña a este correo.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md font-semibold disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Nueva Contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}