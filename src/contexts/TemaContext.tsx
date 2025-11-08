// contexts/TemaContext.tsx
'use client'

import React, { createContext, useContext } from 'react'
import { useTema } from '@/hooks/useTema'

interface TemaContextType {
  tema: 'claro' | 'oscuro'
  cambiarTema: (nuevoTema: 'claro' | 'oscuro') => void
  alternarTema: () => void
  esOscuro: boolean
}

const TemaContext = createContext<TemaContextType | undefined>(undefined)

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const tema = useTema()

  return (
    <TemaContext.Provider value={tema}>
      {children}
    </TemaContext.Provider>
  )
}

export function useTemaContext() {
  const context = useContext(TemaContext)
  if (context === undefined) {
    throw new Error('useTemaContext debe usarse dentro de un TemaProvider')
  }
  return context
}