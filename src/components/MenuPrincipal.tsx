"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function MenuPrincipal() {
  const rutaActual = usePathname();
  const navegador = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [rutaAnterior, setRutaAnterior] = useState(rutaActual);

  // Inicializar el nombre del usuario directamente en useState
  const [nombreUsuario, setNombreUsuario] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nombreUsuario") || "";
    }
    return "";
  });

  // Cerrar menú cuando cambia la ruta actual - SIN USAR EFFECT
  if (rutaActual !== rutaAnterior) {
    setMenuAbierto(false);
    setRutaAnterior(rutaActual);
  }

  // Prevenir scroll cuando el menú está abierto
  useEffect(() => {
    if (menuAbierto) {
      document.body.style.overflow = 'hidden';
      // Agregar event listener para cerrar menú con Escape
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMenuAbierto(false);
        }
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [menuAbierto]);

  /**
   * Verifica si la ruta actual coincide con la ruta proporcionada
   */
  const estaActiva = (ruta: string) => {
    return rutaActual === ruta;
  };

  /**
   * Maneja el cierre de sesión del usuario
   */
  const manejarCerrarSesion = () => {
    localStorage.removeItem("estaLogueado");
    localStorage.removeItem("emailUsuario");
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("nombreUsuario");
    setNombreUsuario("");
    navegador.push("/");
  };

  // Estilos base para los enlaces de navegación
  const estiloBase = "px-3 py-2 rounded-md transition-colors flex items-center justify-center";
  const estiloActivo = "bg-blue-600 text-white";
  const estiloInactivo = "bg-custom-card text-custom-foreground hover:bg-gray-300 dark:hover:bg-gray-600 border border-custom-card";

  // Estilos para el menú móvil
  const estiloEnlaceMovil = "block py-4 text-xl font-medium border-b border-gray-200 dark:border-gray-700 transition-colors";
  const estiloActivoMovil = "text-blue-600 dark:text-blue-400";
  const estiloInactivoMovil = "text-custom-foreground hover:text-blue-600 dark:hover:text-blue-400";

  return (
    <header className="bg-custom-header border-b border-custom-header transition-colors duration-300">
      {/* Navegación Desktop */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo y mensaje de bienvenida */}
          <div className="flex items-center space-x-4">
            <Image
              src="/img/logo_DPortfolio.png"
              alt="DPortfolio"
              width={50}
              height={50}
              className="h-10 w-auto"
              priority
            />
            {nombreUsuario && (
              <p className="text-sm text-custom-foreground">
                Hola, <span className="font-medium">{nombreUsuario}</span>
              </p>
            )}
          </div>

          {/* Navegación central */}
          <nav className="flex space-x-2 items-center">
            <Link
              href="/inicio"
              className={`${estiloBase} ${
                estaActiva("/inicio") ? estiloActivo : estiloInactivo
              }`}
            >
              Portfolio
            </Link>
            <Link
              href="/alertas"
              className={`${estiloBase} ${
                estaActiva("/alertas") ? estiloActivo : estiloInactivo
              }`}
            >
              Alertas
            </Link>
          </nav>

          {/* Botones de acción */}
          <div className="flex items-center space-x-2">
            <Link
              href="/configuracion"
              className={`p-3 rounded-md transition-colors ${
                estaActiva("/configuracion")
                  ? "bg-blue-600 text-white"
                  : "bg-custom-card text-custom-foreground hover:bg-gray-300 dark:hover:bg-gray-600 border border-custom-card"
              }`}
              title="Configuración"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <button
              onClick={manejarCerrarSesion}
              className="p-3 bg-red-600 hover:bg-red-700 rounded-md transition-colors text-white border border-red-600"
              title="Cerrar sesión"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navegación Mobile */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/img/logo_DPortfolio.png"
              alt="DPortfolio"
              width={40}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>

          {/* Botón hamburguesa */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2 rounded-md bg-custom-card text-custom-foreground border border-custom-card"
            aria-label="Menú principal"
          >
            <div className="w-6 h-6 relative">
              <span className={`absolute top-1 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                menuAbierto ? 'rotate-45 top-3' : ''
              }`} />
              <span className={`absolute top-3 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                menuAbierto ? 'opacity-0' : ''
              }`} />
              <span className={`absolute top-5 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                menuAbierto ? '-rotate-45 top-3' : ''
              }`} />
            </div>
          </button>
        </div>

        {/* Menú desplegable móvil */}
        <div className={`fixed inset-0 bg-custom-background z-50 transition-transform duration-300 ease-in-out ${
          menuAbierto ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Header del menú móvil */}
          <div className="container mx-auto px-4 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
            <Image
              src="/img/logo_DPortfolio.png"
              alt="DPortfolio"
              width={40}
              height={40}
              className="h-8 w-auto"
              priority
            />
            <button
              onClick={() => setMenuAbierto(false)}
              className="p-2 text-custom-foreground"
              aria-label="Cerrar menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido del menú móvil */}
          <div className="container mx-auto px-4 py-8">
            {/* Información del usuario */}
            {nombreUsuario && (
              <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                <p className="text-lg text-custom-foreground">
                  Hola, <span className="font-semibold">{nombreUsuario}</span>
                </p>
              </div>
            )}

            {/* Navegación principal */}
            <nav className="space-y-2 mb-8">
              <Link
                href="/inicio"
                className={`${estiloEnlaceMovil} ${
                  estaActiva("/inicio") ? estiloActivoMovil : estiloInactivoMovil
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  Portfolio
                </div>
              </Link>

              <Link
                href="/alertas"
                className={`${estiloEnlaceMovil} ${
                  estaActiva("/alertas") ? estiloActivoMovil : estiloInactivoMovil
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Alertas
                </div>
              </Link>

              <Link
                href="/configuracion"
                className={`${estiloEnlaceMovil} ${
                  estaActiva("/configuracion") ? estiloActivoMovil : estiloInactivoMovil
                }`}
                onClick={() => setMenuAbierto(false)}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuración
                </div>
              </Link>
            </nav>

            {/* Botón de cerrar sesión */}
            <button
              onClick={() => {
                manejarCerrarSesion();
                setMenuAbierto(false);
              }}
              className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}