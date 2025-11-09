// app/api/binance/balance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { binanceService } from '@/lib/servicioBinance'
import { decrypt } from '@/lib/encriptacion'
import { getSupabaseClient } from '@/lib/supabase'

// ✅ Fuerza a usar entorno Node.js (no Edge)
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ 
        totalBalance: 0, 
        connected: false,
        exchangesCount: 0 
      })
    }

    const supabase = getSupabaseClient()

    const { data: connection, error: connectionError } = await supabase
      .from('exchanges')
      .select('*')
      .eq('user_id', userId)
      .eq('exchange', 'BINANCE')
      .eq('is_active', true)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json({ 
        totalBalance: 0, 
        connected: false,
        exchangesCount: 0
      })
    }

    const apiKey = decrypt(connection.api_key)
    const apiSecret = decrypt(connection.api_secret)

    // 🧪 --- DIAGNÓSTICO ---
    // 1️⃣ Prueba si Vercel puede hablar con la API pública de Binance
    try {
      const pingRes = await fetch('https://api.binance.com/api/v3/time')
      const pingData = await pingRes.json()
      console.log('✅ Binance public API reachable:', pingData)
    } catch (publicError) {
      console.error('❌ Error reaching Binance public API:', publicError)
    }

    // 2️⃣ Envuelve la llamada a binanceService en logging detallado
    let totalBalance = 0
    try {
      totalBalance = await binanceService.getTotalUSDBalance({ apiKey, apiSecret })
      console.log('✅ Binance balance result:', totalBalance)
    } catch (binanceError: any) {
      console.error('❌ Binance balance error details:')
      console.error('message:', binanceError?.message)
      console.error('response:', binanceError?.response?.data)
      console.error('stack:', binanceError?.stack)
      throw new Error('Binance API request failed')
    }

    const { data: exchanges, error: exchangesError } = await supabase
      .from('exchanges')
      .select('exchange')
      .eq('user_id', userId)
      .eq('is_active', true)

    const exchangesCount = exchanges?.length || 0

    return NextResponse.json({ 
      totalBalance,
      connected: true,
      exchangesCount
    })
  } catch (error) {
    console.error('Error fetching Binance balance:', error)
    return NextResponse.json({ 
      totalBalance: 0, 
      connected: false,
      exchangesCount: 0,
      error: 'Error al obtener balance (ver logs en Vercel)'
    })
  }
}
