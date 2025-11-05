'use client'

import { useState, useEffect } from 'react'

type Tema = 'claro' | 'oscuro'

function obtenerTemaInicial(): Tema {
  // Solo se ejecuta en el cliente
  if (typeof window === 'undefined') return 'oscuro'
  
  const temaGuardado = localStorage.getItem('tema') as Tema
  if (temaGuardado) return temaGuardado
  
  const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
  return preferenciaSistema
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(obtenerTemaInicial)

  // Aplicar tema al documento
  const aplicarTema = (tema: Tema) => {
    const root = document.documentElement
    
    if (tema === 'oscuro') {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.removeAttribute('data-theme')
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  // Aplicar el tema cuando cambia el estado
  useEffect(() => {
    aplicarTema(tema)
  }, [tema])

  // Función para cambiar el tema
  const cambiarTema = (nuevoTema: Tema) => {
    setTema(nuevoTema)
    localStorage.setItem('tema', nuevoTema)
  }

  // Función para alternar entre claro/oscuro
  const alternarTema = () => {
    const nuevoTema = tema === 'oscuro' ? 'claro' : 'oscuro'
    cambiarTema(nuevoTema)
  }

  return {
    tema,
    cambiarTema,
    alternarTema,
    esOscuro: tema === 'oscuro'
  }
}