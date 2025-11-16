"use client";

import MenuPrincipal from '@/components/MenuPrincipal'
import ProtectedRoute from '@/components/ContenidoPrivado'
import TablaAlertas, { Alerta } from '@/components/controles/tablas/TablaAlertas'
import { useState } from 'react'

export default function Alertas() {
  const [alerts, setAlerts] = useState<Alerta[]>([
    {
      id: '1',
      crypto: 'BTC',
      condicion: 'above',
      precio: 50000,
      estado: 'active',
      fechaCreacion: '2024-01-15'
    },
    {
      id: '2',
      crypto: 'ETH',
      condicion: 'below',
      precio: 3000,
      estado: 'triggered',
      fechaCreacion: '2024-01-14'
    },
    {
      id: '3',
      crypto: 'ADA',
      condicion: 'above',
      precio: 0.5,
      estado: 'active',
      fechaCreacion: '2024-01-16'
    }
  ])

  const handleDelete = (alert: Alerta) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la alerta de ${alert.crypto}?`)) {
      setAlerts(alerts.filter(a => a.id !== alert.id))
    }
  }

  const handleAddAlert = () => {
    const newAlert: Alerta = {
      id: Date.now().toString(),
      crypto: 'SOL',
      condicion: 'above',
      precio: 150,
      estado: 'active',
      fechaCreacion: new Date().toISOString().split('T')[0]
    }
    setAlerts([...alerts, newAlert])
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-custom-background text-custom-foreground">
        <MenuPrincipal />
        
        <main className="container mx-auto p-4">
          <div className="flex flex-col space-y-6">
            {/* Header con título y botón */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-custom-text">Alertas Cripto</h1>
                <p className="text-custom-text-secondary mt-2">
                  Gestiona tus alertas de precios de criptomonedas
                </p>
              </div>
              <button
                onClick={handleAddAlert}
                className="bg-custom-accent hover:bg-custom-accent-hover text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200 shadow-md"
              >
                <span className="text-lg">+</span>
                <span>Añadir Nueva Alerta</span>
              </button>
            </div>

            {/* Surface con la tabla */}
            <div className="bg-custom-surface p-6 rounded-lg shadow-lg border border-custom-border">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-custom-text">
                  Alertas Configuradas ({alerts.length})
                </h2>
                <p className="text-custom-text-secondary text-sm mt-1">
                  Todas tus alertas activas y pasadas aparecerán aquí
                </p>
              </div>
              
              <TablaAlertas
                alerts={alerts}
                onDelete={handleDelete}
                emptyMessage={
                  <div className="text-center py-8">
                    <div className="text-custom-text-secondary text-lg mb-2">
                      No hay alertas configuradas
                    </div>
                    <button
                      onClick={handleAddAlert}
                      className="text-custom-accent hover:text-custom-accent-hover font-medium"
                    >
                      Crear tu primera alerta
                    </button>
                  </div>
                }
              />
            </div>

            {/* Información adicional */}
            <div className="bg-custom-surface p-4 rounded-lg border border-custom-border">
              <h3 className="font-semibold text-custom-text mb-2">¿Cómo funcionan las alertas?</h3>
              <p className="text-custom-text-secondary text-sm">
                Recibirás una notificación cuando el precio de la criptomoneda alcance el objetivo establecido. 
                Las alertas se mantienen activas hasta que sean activadas o las elimines manualmente.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}