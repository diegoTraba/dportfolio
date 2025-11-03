'use server'

import { sendEmail } from './servicioEmail'
import { WelcomeEmail, PasswordChangedEmail } from '@/components/email/PlantillaEmail'

export async function sendWelcomeEmail(email: string, userName: string, password: string) {
  return await sendEmail(
    email,
    '¡Bienvenido a DPortfolio!',
    WelcomeEmail({ userName, email, password })
  )
}

export async function sendPasswordChangedEmail(email: string, userName: string) {
  return await sendEmail(
    email,
    'Contraseña actualizada - DPortfolio',
    PasswordChangedEmail({ userName })
  )
}