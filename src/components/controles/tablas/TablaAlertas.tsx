"use client";

import React from 'react';

// Tipos específicos para alertas
export type AlertStatus = 'active' | 'triggered' | 'cancelled';
export type ConditionType = 'above' | 'below';

export interface Alerta {
  id: string;
  crypto: string;
  condicion: ConditionType;
  precio: number;
  estado: AlertStatus;
  fechaCreacion: string;
}

interface TablaAlertasProps {
  alerts: Alerta[];
  onEdit?: (alert: Alerta) => void;
  onDelete?: (alert: Alerta) => void;
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
}

const TablaAlertas: React.FC<TablaAlertasProps> = ({
  alerts,
  onEdit,
  onDelete,
  isLoading = false,
  emptyMessage = 'No hay alertas configuradas'
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-accent"></div>
      </div>
    );
  }

  const hasActions = !!(onEdit || onDelete);

  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <table className="min-w-full divide-y divide-custom-border">
        <thead className="bg-custom-header">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-custom-foreground uppercase tracking-wider">
              Criptomoneda
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-custom-foreground uppercase tracking-wider">
              Condición
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-custom-foreground uppercase tracking-wider">
              Precio Objetivo (USD)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-custom-foreground uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-custom-foreground uppercase tracking-wider">
              Fecha de Creación
            </th>
            {hasActions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-custom-foreground uppercase tracking-wider">
                Acciones
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-custom-surface divide-y divide-custom-border">
          {alerts.length === 0 ? (
            <tr>
              <td 
                colSpan={hasActions ? 6 : 5} 
                className="px-6 py-4 text-center text-custom-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-custom-card transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-custom-foreground">
                  {alert.crypto}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-custom-foreground">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    alert.condicion === 'above' 
                      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700' 
                      : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
                  }`}>
                    {alert.condicion === 'above' ? 'Por encima de' : 'Por debajo de'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-custom-foreground">
                  <span className="font-semibold">
                    ${alert.precio.toLocaleString('es-ES', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-custom-foreground">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    alert.estado === 'active' 
                      ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700' 
                      : alert.estado === 'triggered'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
                      : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600'
                  }`}>
                    {alert.estado === 'active' ? 'Activa' : 
                     alert.estado === 'triggered' ? 'Activada' : 'Cancelada'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-custom-foreground">
                  {new Date(alert.fechaCreacion).toLocaleDateString('es-ES')}
                </td>
                {hasActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(alert)}
                        className="text-custom-accent hover:text-custom-accent-hover transition-colors duration-200"
                      >
                        Editar
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(alert)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaAlertas;