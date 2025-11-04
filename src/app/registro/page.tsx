'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CampoContrasenia from '@/components/CampoContrasenia'
import { validarEmail, validarContrasenia } from '@/lib/Validaciones'
import Aviso from '@/components/Aviso'

export default function Registro() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{email?: string, password?: string, confirmPassword?: string}>({})
  const [serverError, setServerError] = useState('')
  
  const router = useRouter()

  const passwordValidation = validarContrasenia(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setServerError('')

    // Validaciones del frontend
    const newErrors: {email?: string, password?: string, confirmPassword?: string} = {}

    if (!validarEmail(email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (!passwordValidation.isValid) {
      newErrors.password = 'La contraseña no cumple los requisitos'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      // Verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        setServerError('Ya existe un usuario con este email')
        setLoading(false)
        return
      }

      // Hash de la contraseña
      const bcrypt = await import('bcryptjs')
      const hashedPassword = await bcrypt.hash(password, 12)

      // Crear el usuario
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            email: email,
            name: name,
            password: hashedPassword
          }
        ])
        .select()

      if (insertError) {
        throw insertError
      }

      // Enviar email de bienvenida
      const { enviarEmailAlta } = await import('@/lib/email/accionesEmail')
      await enviarEmailAlta(email, name, password)


      // Registro exitoso - redirigir al login
      alert('Registro exitoso! Se ha enviado un correo con tus credenciales. Ya puedes iniciar sesión')
      router.push('/')

    } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'message' in err) {
          const error = err as { message: string }
          setServerError('Error en el registro: ' + error.message)
        } else {
          setServerError('Error en el registro: Error desconocido')
        }
    } finally {
    setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>
        
        {serverError && (
          <Aviso 
          tipo="error"
          mensaje={serverError}
          className="mb-4"
        />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <CampoContrasenia
              value={password}
              onChange={setPassword}
              placeholder="Contraseña"
              error={errors.password}
            />
            
            {/* Indicadores de requisitos de contraseña */}
            <div className="mt-2 text-xs text-gray-400">
              <p>La contraseña debe tener:</p>
              <ul className="list-disc list-inside mt-1">
                <li className={passwordValidation.requirements.minLength ? 'text-green-400' : ''}>
                  Al menos 6 caracteres
                </li>
                <li className={passwordValidation.requirements.upperCase ? 'text-green-400' : ''}>
                  Una mayúscula
                </li>
                <li className={passwordValidation.requirements.lowerCase ? 'text-green-400' : ''}>
                  Una minúscula
                </li>
                <li className={passwordValidation.requirements.number ? 'text-green-400' : ''}>
                  Un número
                </li>
                <li className={passwordValidation.requirements.symbol ? 'text-green-400' : ''}>
                  Un símbolo
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
            <CampoContrasenia
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repite tu contraseña"
              error={errors.confirmPassword}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 py-2 px-4 rounded-md font-semibold disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}