import {Trade} from "@/interfaces/cripto.types"
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
  activado?: string;
}

export interface TarjetaAlertaProps {
  alerta: Alerta;
  onEditar: (alerta: Alerta) => void;
  onReactivar: (id: number) => void;
  onEliminar: (id: number) => void;
}

export interface ApiResponse {
  success: boolean;
  trades: Trade[];
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
  date: string;
  product: string;
  quantity: number;
  price: number;
  status: string;
  total?: number;
}
