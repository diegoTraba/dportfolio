// utils/activityTracker.ts
'use client';

let lastActivityTime = Date.now();

// Eventos que consideramos como "actividad del usuario"
const ACTIVITY_EVENTS = [
  'mousedown', 'mousemove', 'keypress', 'scroll', 
  'touchstart', 'click', 'input', 'focus'
];

// Actualizar el tiempo de última actividad
export const updateActivityTime = () => {
  lastActivityTime = Date.now();
};

// Inicializar el tracker de actividad
export const startActivityTracking = () => {
  // Solo en cliente
  if (typeof window === 'undefined') return;
  
  // Agregar listeners para todos los eventos de actividad
  ACTIVITY_EVENTS.forEach(event => {
    document.addEventListener(event, updateActivityTime, true);
  });
  
  console.log('🕵️‍♂️ Activity tracking iniciado');
};

// Detener el tracker (en logout)
export const stopActivityTracking = () => {
  if (typeof window === 'undefined') return;
  
  ACTIVITY_EVENTS.forEach(event => {
    document.removeEventListener(event, updateActivityTime, true);
  });
  
  console.log('🛑 Activity tracking detenido');
};

// Verificar si el usuario ha estado activo en los últimos X minutos
export const isUserActive = (minutes = 30) => {
  const currentTime = Date.now();
  const minutesInMs = minutes * 60 * 1000;
  const timeSinceLastActivity = currentTime - lastActivityTime;
  
  return timeSinceLastActivity < minutesInMs;
};

// Función para decodificar el token JWT y obtener la expiración
export const getTokenRemainingMinutes = (token: string): number => {
  if (!token) return 0;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    if (!decoded.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const timeLeftInSeconds = decoded.exp - currentTime;
    const timeLeftInMinutes = Math.floor(timeLeftInSeconds / 60);
    
    return timeLeftInMinutes;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return 0;
  }
};