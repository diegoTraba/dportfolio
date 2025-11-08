// app/api/binance/connect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { binanceService } from '@/lib/servicioBinance'
import { encrypt } from '@/lib/encriptacion'
import { getSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIANDO CONEXIÓN BINANCE ===')
    
    // Verificar ENCRYPTION_KEY primero
    if (!process.env.ENCRYPTION_KEY) {
      console.error('ENCRYPTION_KEY no definida')
      return NextResponse.json({ 
        error: 'Error de configuración del servidor' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { apiKey, apiSecret, userId } = body

    console.log('Datos recibidos:', {
      userId,
      apiKey: apiKey ? `...${apiKey.slice(-4)}` : 'undefined',
      apiSecret: apiSecret ? `...${apiSecret.slice(-4)}` : 'undefined'
    })

    if (!userId) {
      console.error('UserId no proporcionado')
      return NextResponse.json({ error: 'Usuario no identificado' }, { status: 401 })
    }

    if (!apiKey || !apiSecret) {
      console.error('API Key o Secret faltantes')
      return NextResponse.json({ error: 'API Key y Secret son requeridos' }, { status: 400 })
    }

    console.log('Probando conexión con Binance...')
    const isValid = await binanceService.testConnection({ apiKey, apiSecret })
    console.log('Conexión Binance válida:', isValid)
    
    if (!isValid) {
      console.error('Credenciales de Binance inválidas')
      return NextResponse.json({ error: 'Credenciales de Binance inválidas' }, { status: 401 })
    }

    console.log('Encriptando credenciales...')
    const encryptedApiKey = encrypt(apiKey)
    const encryptedApiSecret = encrypt(apiSecret)

    console.log('Conectando con Supabase...')
    const supabase = getSupabaseClient()
    
    console.log('Guardando en base de datos...')
    const { data: exchange, error: exchangeError } = await supabase
      .from('exchanges')
      .upsert({
        user_id: userId,
        exchange: 'BINANCE',
        api_key: encryptedApiKey,
        api_secret: encryptedApiSecret,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (exchangeError) {
      console.error('Error saving exchange:', exchangeError)
      return NextResponse.json({ 
        error: 'Error al guardar la conexión en la base de datos' 
      }, { status: 500 })
    }

    console.log('Obteniendo balance total...')
    const totalBalance = await binanceService.getTotalUSDBalance({ apiKey, apiSecret })
    console.log('Balance total obtenido:', totalBalance)

    console.log('=== CONEXIÓN EXITOSA ===')
    return NextResponse.json({ 
      success: true, 
      totalBalance,
      message: 'Binance conectado correctamente' 
    })
  } catch (error) {
    console.error('=== ERROR EN CONEXIÓN BINANCE ===', error)
    return NextResponse.json({ 
      error: 'Error al conectar con Binance. Verifica tus credenciales.' 
    }, { status: 500 })
  }
}