// hooks/useUserId.ts
//Obtiene el id de usuario almacenado en localstorage del navegador cuando el componente se monta
import { useState, useEffect } from 'react'

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const cargarUserId = async () => {
      if (typeof window !== 'undefined') {
        const id = localStorage.getItem('idUsuario')
        setUserId(id)
      }
    }

    cargarUserId()
  }, [])

  return userId
}