'use server'

import { sendEmail } from './servicioEmail'
import { EmailAlta, EmailCambioContrasenia, EmailRecuperarContrasenia } from '@/components/email/PlantillaEmail'

export async function enviarEmailAlta(email: string, userName: string, password: string) {
  return await sendEmail(
    email,
    '¡Bienvenido a DPortfolio!',
    EmailAlta({ userName, email, password })
  )
}

export async function enviarEmailCambioContrasenia(email: string, userName: string) {
  return await sendEmail(
    email,
    'Contraseña actualizada - DPortfolio',
    EmailCambioContrasenia({ userName })
  )
}

export async function enviarRecuperarContrasenia(email: string, userName: string, newPassword: string) {
  return await sendEmail(
    email,
    'Recuperación de Contraseña - DPortfolio',
    EmailRecuperarContrasenia({ userName, email, newPassword })
  )
}