// components/modals/ModalBinance.tsx
'use client'

import { useState } from 'react'
import Boton from '@/components/controles/Boton'

interface ModalBinanceProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (apiKey: string, apiSecret: string) => Promise<void>
}

export default function ModalBinance({ isOpen, onClose, onConnect }: ModalBinanceProps) {
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showInstructions, setShowInstructions] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onConnect(apiKey, apiSecret)
      onClose()
      setApiKey('')
      setApiSecret('')
    } catch (err) {
      setError('Error al conectar con Binance. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-custom-surface rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Conectar Binance</h2>
        
        {/* Botón de instrucciones */}
        <div className="mb-4">
          <Boton
            texto={showInstructions ? "Ocultar instrucciones" : "¿Cómo obtener mis credenciales?"}
            variante="secundario"
            tamaño="pequeno"
            onClick={() => setShowInstructions(!showInstructions)}
          />
        </div>

        {/* Instrucciones */}
        {showInstructions && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold mb-2">Instrucciones para obtener API Key:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Inicia sesión en <a href="https://binance.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Binance</a></li>
              <li>Ve a tu perfil → API Management</li>
              <li>Crea una nueva API Key con nombre descriptivo como Mi Dashboard</li>
              <li>
                <strong>Configura SOLO estos permisos:</strong>
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li className="text-green-600">✅ Enable Reading (OBLIGATORIO)</li>
                  <li className="text-red-600">❌ Enable Spot & Margin Trading (NO marcar)</li>
                  <li className="text-red-600">❌ Enable Withdrawals (NUNCA marcar)</li>
                </ul>
              </li>
              <li>
                <strong>Restricciones de IP:</strong> 
                <span className="text-yellow-600"> Puedes dejarlo sin marcar por ahora</span>
              </li>
              <li>
                <strong>⚠️ IMPORTANTE:</strong> El Secret Key solo se muestra una vez. 
                Guárdalo en un lugar seguro.
              </li>
            </ol>
            
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <strong>🔒 Nota sobre seguridad:</strong> Esta aplicación solo leerá tus balances. 
              No tiene permisos para hacer trading ni retirar fondos.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-custom-background text-custom-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="pej. 6Lg7s9aB2cKp5qR8wE0tY3uI1oP7mN9xZ4vC..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">API Secret</label>
              <input
                type="password"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md bg-custom-background text-custom-foreground focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="pej. fT8j5qW3eR7iK9pL2oM1nB6vC4xZ8aS0dF..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ El Secret Key solo se muestra una vez al crear la API. Si lo pierdes, tendrás que crear una nueva.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              ❌ {error}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <Boton
              texto="Cancelar"
              variante="secundario"
              tamaño="mediano"
              onClick={onClose}
              type="button"
            />
            <Boton
              texto={loading ? "Conectando..." : "Conectar Exchange"}
              variante="primario"
              tamaño="mediano"
              type="submit"
              loading={loading}
              disabled={loading || !apiKey || !apiSecret}
            />
          </div>
        </form>
      </div>
    </div>
  )
}