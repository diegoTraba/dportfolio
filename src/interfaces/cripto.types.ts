/**
 * INTERFAZ: BalanceData
 *
 * Define la estructura de los datos de balance que se manejan en esta página
 * - totalBalance: Balance total en USD del usuario
 * - connected: Si el usuario tiene exchanges conectados
 * - exchangesCount: Número de exchanges conectados
 * - loading: Estado de carga para mostrar spinners
 */
export interface BalanceData {
  totalBalance: number;
  connected: boolean;
  exchangesCount: number;
  loading: boolean;
}

// Definir la interfaz basada en lo que devuelve la API
export interface Trade {
  id: number;
  orderId: number;
  symbol: string;
  price: number;
  quantity: number;
  total: number;
  commission: number;
  commissionAsset: string;
  timestamp: number;
  date: string;
  isBuyer: boolean;
  isMaker: boolean;
}
