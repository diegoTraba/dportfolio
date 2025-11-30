// components/alertas/TarjetaAlerta.tsx
import { IconoCampana, IconoObjetivo, IconoFlechaArriba, IconoFleChaAbajo, IconoRefrescar } from "@/components/controles/Iconos";
import {TarjetaAlertaProps} from "@/interfaces/comun.types";

export default function TarjetaAlerta({ alerta, onEditar, onReactivar, onEliminar }: TarjetaAlertaProps) {
  return (
    <div
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
            <IconoCampana />
            <span className="text-custom-text-secondary text-sm">Condición</span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${
              alerta.condicion === 'por encima de'
                ? 'bg-condicion-arriba text-condicion-arriba'
                : 'bg-condicion-abajo text-condicion-abajo'
            }`}
          >
            {alerta.condicion === 'por encima de' ? <IconoFlechaArriba /> : <IconoFleChaAbajo />}
            <span>
              {alerta.condicion === 'por encima de' ? 'Por encima' : 'Por debajo'}
            </span>
          </span>
        </div>
        
        {/* Precio objetivo con icono */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <IconoObjetivo />
            <span className="text-custom-text-secondary text-sm">Precio Objetivo</span>
          </div>
          <span className="text-custom-text font-bold">
            ${alerta.precio_objetivo.toLocaleString()}
          </span>
        </div>

        {/* Precio actual (si está disponible) */}
        {alerta.precio_actual && (
          <div className="flex items-center justify-between pt-2 border-t border-custom-border">
            <span className="text-custom-text-secondary text-sm">Precio Actual</span>
            <span className="text-custom-text font-semibold">
              ${alerta.precio_actual.toLocaleString()}
            </span>
          </div>
        )}

        {/* Fecha de activación (si está disponible) */}
        {alerta.activado && (
          <div className="flex items-center justify-between pt-2 border-t border-custom-border">
            <span className="text-custom-text-secondary text-sm">Activada el</span>
            <span className="text-custom-text text-xs">
              {new Date(alerta.activado).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="mt-4 flex space-x-2">
        {alerta.estado === 'activo' ? (
          <>
            <button 
              onClick={() => onReactivar(alerta.id)}
              className="flex-1 bg-custom-accent hover:bg-custom-accent-hover text-white py-2 px-3 rounded text-sm transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <IconoRefrescar />
              <span>Reactivar</span>
            </button>
            <button 
              onClick={() => onEliminar(alerta.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors duration-200"
            >
              Eliminar
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => onEditar(alerta)}
              className="flex-1 bg-custom-accent hover:bg-custom-accent-hover text-white py-2 px-3 rounded text-sm transition-colors duration-200"
            >
              Editar
            </button>
            <button 
              onClick={() => onEliminar(alerta.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors duration-200"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}