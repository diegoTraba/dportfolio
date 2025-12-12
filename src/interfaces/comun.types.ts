/**
 * INTERFAZ: Alerta
 *
 * Define la estructura de una alerta
 */
export interface Alerta {
  id: number;
  user_id?: string;
  criptomoneda: string;
  condicion: "por encima de" | "por debajo de";
  precio_objetivo: number;
  precio_actual?: number;
  estado?: "pendiente" | "activo";
  creado?: string;
  leida?: boolean;
  activado?: string;
}

export interface TarjetaAlertaProps {
  alerta: Alerta;
  onEditar: (alerta: Alerta) => void;
  onReactivar: (id: number) => void;
  onEliminar: (id: number) => void;
}

// Tipos para las notificaciones
export interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  datos_adicionales?: {
    criptomoneda: string;
    precio_objetivo: number;
    precio_actual: number;
    condicion: string;
  };
}

export interface WSMessage {
  tipo:
    | "nueva_notificacion"
    | "notificaciones_actualizadas"
    | "ping"
    | "error_autenticacion";
  datos:
    | {
        id: number;
        criptomoneda: string;
        precio_objetivo: number;
        precio_actual: number;
        condicion: string;
      } // para "nueva_notificacion"
    | Notificacion[] // para "notificaciones_actualizadas"
    | undefined
    | string; // para "ping" o "error_autenticacion"
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

interface Usuario {
  id: string;
  email: string;
  nombre: string;
  ultimoAcceso?: string;
}

export interface PreferenciasUsuario {
  notificacionesEmail: boolean; // Notificaciones por email
  notificacionesPush: boolean; // Notificaciones push del navegador
  monedaPrincipal: string; // Moneda principal (USD, EUR, BTC)
}

export interface ApiResponse {
  success: boolean;
  compras: Compra[];
  total: number;
  symbolsScanned: string[];
  query: {
    startTime: string | null;
    endTime: string | null;
    limit: number;
  };
}

// Interfaz para el componente TablaCompras (adaptada a los datos de la API)
export interface Compra {
  id: number;
  idUsuario?: number;
  exchange:string;
  idOrden?:string;
  simbolo: string;
  precio: number;
  cantidad: number;
  total: number;
  comision: number;
  fechaCompra: string;
  vendida?: boolean; 
}

export interface PrecioActual {
  id: number;
  simbolo: string;
  precio: number;
  fechaActualizacion: string;
}
