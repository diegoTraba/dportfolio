// hooks/useTema.ts
//se usa en Temacontext para establecer el tema para todas las paginas del proyecto en el layout
'use client'

import { useState, useEffect } from 'react'

type Tema = 'claro' | 'oscuro'

export function useTema() {
  const [tema, setTema] = useState<Tema>('oscuro')
  const [cargado, setCargado] = useState(false)

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

  // Inicializar el tema al montar el componente
  useEffect(() => {
    // Solo se ejecuta en el cliente
    if (typeof window === 'undefined') return

    const obtenerTemaInicial = (): Tema => {
      const temaGuardado = localStorage.getItem('tema') as Tema
      if (temaGuardado) return temaGuardado
      
      const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
      return preferenciaSistema
    }

    const temaInicial = obtenerTemaInicial()
    
    // Aplicar el tema inmediatamente al documento
    aplicarTema(temaInicial)
    
    // Luego actualizar el estado
    setTema(temaInicial)
    setCargado(true)

    // Escuchar cambios en la preferencia del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const manejarCambioSistema = (e: MediaQueryListEvent) => {
      // Solo cambiar si no hay tema guardado manualmente
      if (!localStorage.getItem('tema')) {
        const nuevoTema = e.matches ? 'oscuro' : 'claro'
        aplicarTema(nuevoTema)
        setTema(nuevoTema)
      }
    }

    mediaQuery.addEventListener('change', manejarCambioSistema)

    return () => {
      mediaQuery.removeEventListener('change', manejarCambioSistema)
    }
  }, [])

  // Función para cambiar el tema
  const cambiarTema = (nuevoTema: Tema) => {
    if (!cargado) return
    
    aplicarTema(nuevoTema)
    setTema(nuevoTema)
    localStorage.setItem('tema', nuevoTema)
  }

  // Función para alternar entre claro/oscuro
  const alternarTema = () => {
    if (!cargado) return
    
    const nuevoTema = tema === 'oscuro' ? 'claro' : 'oscuro'
    cambiarTema(nuevoTema)
  }

  return {
    tema,
    cambiarTema,
    alternarTema,
    esOscuro: tema === 'oscuro',
    cargado
  }
}