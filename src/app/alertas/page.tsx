"use client";

import MenuPrincipal from '@/components/MenuPrincipal'
import ProtectedRoute from '@/components/ContenidoPrivado'
import { useState } from 'react'

// Interfaz para definir el tipo de una alerta
interface Alerta {
  id: number;
  criptomoneda: string;
  condicion: 'por encima de' | 'por debajo de';
  precioObjetivo: number;
  estado: 'pendiente' | 'activo';
  precioActual?: number;
}

export default function Alertas() {
  // Estado con datos de ejemplo para las alertas
  const [alertas, setAlertas] = useState<Alerta[]>([
    {
      id: 1,
      criptomoneda: 'BTC',
      condicion: 'por encima de',
      precioObjetivo: 50000,
      estado: 'pendiente',
      precioActual: 48900
    },
    {
      id: 2,
      criptomoneda: 'ETH',
      condicion: 'por debajo de',
      precioObjetivo: 3000,
      estado: 'activo',
      precioActual: 3050
    },
    {
      id: 3,
      criptomoneda: 'ADA',
      condicion: 'por encima de',
      precioObjetivo: 1.5,
      estado: 'pendiente',
      precioActual: 1.45
    },
    {
      id: 4,
      criptomoneda: 'SOL',
      condicion: 'por debajo de',
      precioObjetivo: 120,
      estado: 'activo',
      precioActual: 125
    }
  ]);

  const handleReactivarAlerta = (id: number) => {
    setAlertas(alertas.map(alerta => 
      alerta.id === id ? { ...alerta, estado: 'pendiente' } : alerta
    ));
  };

  const handleEliminarAlerta = (id: number) => {
    setAlertas(alertas.filter(alerta => alerta.id !== id));
  };

  // Iconos
  const IconTarget = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const IconBell = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-3.77-4.19M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const IconArrowUp = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );

  const IconArrowDown = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );

  const IconRefresh = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );

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
                className="bg-custom-accent hover:bg-custom-accent-hover text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors duration-200 shadow-md"
              >
                <span className="text-lg">+</span>
                <span>Añadir Nueva Alerta</span>
              </button>
            </div>

            {/* Surface con las tarjetas de alertas */}
            <div className="bg-custom-surface p-6 rounded-lg shadow-lg border border-custom-border">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-custom-text">
                  Alertas Configuradas
                </h2>
                <p className="text-custom-text-secondary text-sm mt-1">
                  Todas tus alertas activas y pendientes aparecerán aquí
                </p>
              </div>

              {/* Repeater de tarjetas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                      alerta.estado === 'pendiente'
                        ? 'bg-alerta-pendiente border-alerta-pendiente'
                        : 'bg-alerta-activa border-alerta-activa'
                    }`}
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-custom-text">
                          {alerta.criptomoneda}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alerta.estado === 'pendiente'
                              ? 'bg-badge-pendiente text-badge-pendiente'
                              : 'bg-badge-activo text-badge-activo'
                          }`}
                        >
                          {alerta.estado}
                        </span>
                      </div>
                    </div>
                    
                    {/* Información de la alerta */}
                    <div className="space-y-3">
                      {/* Condición con icono */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconBell />
                          <span className="text-custom-text-secondary text-sm">Condición</span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
                            alerta.condicion === 'por encima de'
                              ? 'bg-condicion-arriba text-condicion-arriba'
                              : 'bg-condicion-abajo text-condicion-abajo'
                          }`}
                        >
                          {alerta.condicion === 'por encima de' ? <IconArrowUp /> : <IconArrowDown />}
                          <span>
                            {alerta.condicion === 'por encima de' ? 'Por encima' : 'Por debajo'}
                          </span>
                        </span>
                      </div>
                      
                      {/* Precio objetivo con icono */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <IconTarget />
                          <span className="text-custom-text-secondary text-sm">Precio Objetivo</span>
                        </div>
                        <span className="text-custom-text font-bold">
                          ${alerta.precioObjetivo.toLocaleString()}
                        </span>
                      </div>

                      {/* Precio actual (si está disponible) */}
                      {alerta.precioActual && (
                        <div className="flex items-center justify-between pt-2 border-t border-custom-border">
                          <span className="text-custom-text-secondary text-sm">Precio Actual</span>
                          <span className="text-custom-text font-semibold">
                            ${alerta.precioActual.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botones de acción */}
                    <div className="mt-4 flex space-x-2">
                      {alerta.estado === 'activo' ? (
                        <>
                          <button 
                            onClick={() => handleReactivarAlerta(alerta.id)}
                            className="flex-1 bg-custom-accent hover:bg-custom-accent-hover text-white py-2 px-3 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
                          >
                            <IconRefresh />
                            <span>Reactivar</span>
                          </button>
                          <button 
                            onClick={() => handleEliminarAlerta(alerta.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors duration-200"
                          >
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="flex-1 bg-custom-accent hover:bg-custom-accent-hover text-white py-2 px-3 rounded text-sm transition-colors duration-200">
                            Editar
                          </button>
                          <button 
                            onClick={() => handleEliminarAlerta(alerta.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors duration-200"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mensaje cuando no hay alertas */}
              {alertas.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-custom-text-secondary">
                    No tienes alertas configuradas. ¡Crea tu primera alerta!
                  </p>
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="bg-custom-surface p-4 rounded-lg border border-custom-border">
              <h3 className="font-semibold text-custom-text mb-2">¿Cómo funcionan las alertas?</h3>
              <p className="text-custom-text-secondary text-sm">
                Recibirás una notificación cuando el precio de la criptomoneda alcance el objetivo establecido. 
                Las alertas se marcan como activas cuando se disparan y puedes reactivarlas para continuar monitoreando.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}