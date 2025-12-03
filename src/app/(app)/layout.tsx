'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from "@/components/ContenidoPrivado";
import MenuPrincipal from "@/components/MenuPrincipal";
import { isUserActive, getTokenRemainingMinutes } from '@/utils/monitoreoActividad';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Aseguramos que este código se ejecute solo en el cliente
    setIsClient(true);
    
    // Función para refrescar el token
    const refreshToken = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        console.log('🔄 Intentando refrescar token...');
        
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        const response = await fetch(`${BACKEND_URL}/api/auth/refresh-token`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al refrescar token');
        }
        
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        console.log('✅ Token refrescado exitosamente');
      } catch (error) {
        console.error('❌ Error refrescando token:', error);
        // Cerrar sesión si falla el refresh
        localStorage.clear();
        window.location.href = '/';
      }
    };

    // Función principal que verifica si es necesario refrescar
    const checkAndRefreshIfNeeded = () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      // 1. Primero, verificar si el token está próximo a expirar (< 30 minutos)
      const remainingMinutes = getTokenRemainingMinutes(token);
      
      console.log(`⏰ Minutos restantes en el token: ${remainingMinutes}`);
      
      // Si el token tiene más de 30 minutos, no hacer nada
      if (remainingMinutes >= 30) {
        console.log('👍 Token aún tiene más de 30 minutos, no es necesario verificar');
        return;
      }
      
      // 2. Solo si el token está próximo a expirar, verificar actividad
      const userActive = isUserActive(30);
      console.log(`🕵️‍♂️ Token próximo a expirar. Usuario activo: ${userActive}`);
      
      if (userActive) {
        // Solo refrescar si el usuario ha estado activo
        refreshToken();
      } else {
        console.log('👤 Usuario inactivo, no se refresca el token');
      }
    };

    // Ejecutar inmediatamente al montar el componente (por si acaso)
    checkAndRefreshIfNeeded();
    
    // Establecer el intervalo para verificar cada 15 minutos (900000 ms)
    const intervalId = setInterval(checkAndRefreshIfNeeded, 15 * 60 * 1000);
    
    // Limpiar el intervalo al desmontar
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Para evitar problemas de hidratación, no renderizamos nada hasta que estemos en el cliente
  if (!isClient) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-custom-background text-custom-foreground">
        <MenuPrincipal />
        <div className="pt-16">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}