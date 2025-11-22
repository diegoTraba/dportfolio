"use client";

import MenuPrincipal from "@/components/MenuPrincipal";
import ProtectedRoute from "@/components/ContenidoPrivado";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserId } from "@/hooks/useUserId";

// Interfaz para definir el tipo de una alerta
interface Alerta {
    id?: number;
    user_id?: string;
    criptomoneda: string;
    condicion: "por encima de" | "por debajo de";
    precio_objetivo: number;
    precio_actual?: number;
    estado?: "pendiente" | "activo";
    creado?: string;
    activado?: string;
  }

export default function EditarAlerta() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useUserId();
  
  // Obtener el id de la alerta desde los query params (si existe)
  const alertaId = searchParams.get("id");
  const esEdicion = !!alertaId;

  const [alerta, setAlerta] = useState<Alerta>({
    criptomoneda: "BTC",
    condicion: "por encima de",
    precio_objetivo: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [precioActual, setPrecioActual] = useState<number | null>(null);

  // Criptomonedas disponibles
  const criptomonedas = [
    "BTC", "ETH", "ADA", "SOL", "DOT", "XRP", "DOGE", "MATIC", 
    "BNB", "LTC", "LINK", "BCH", "XLM", "ETC", "FIL", "EOS"
  ];

  // Cargar datos de la alerta si estamos en modo edición
  useEffect(() => {
    if (esEdicion && alertaId) {
      cargarAlerta();
    }
  }, [esEdicion, alertaId]);

  // Obtener precio actual cuando se selecciona una criptomoneda
  useEffect(() => {
    if (alerta.criptomoneda) {
      obtenerPrecioActual(alerta.criptomoneda);
    }
  }, [alerta.criptomoneda]);

  const cargarAlerta = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://dportfolio-backend-production.up.railway.app/api/alertas/detalle/${alertaId}`);

      if (!response.ok) {
        throw new Error("Error al cargar la alerta");
      }

      const data = await response.json();
      setAlerta(data);
    } catch (err) {
      console.error("Error cargando alerta:", err);
      setError("No se pudo cargar la alerta");
    } finally {
      setLoading(false);
    }
  };

  const obtenerPrecioActual = async (cripto: string) => {
    try {
      const response = await fetch(`https://dportfolio-backend-production.up.railway.app/api/alertas/price/${cripto}USDT`);
      
      if (response.ok) {
        const data = await response.json();
        setPrecioActual(data.price);
      }
    } catch (err) {
      console.error("Error obteniendo precio actual:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!alerta.criptomoneda) {
      setError("Por favor selecciona una criptomoneda");
      return;
    }

    if (!alerta.precio_objetivo || alerta.precio_objetivo <= 0) {
      setError("Por favor ingresa un precio objetivo válido");
      return;
    }

    if (!userId) {
      setError("Usuario no autenticado");
      return;
    }

    try {
      setLoading(true);

      const url = esEdicion 
        ? `https://dportfolio-backend-production.up.railway.app/api/alertas/${alertaId}`
        : "https://dportfolio-backend-production.up.railway.app/api/alertas";

      const method = esEdicion ? "PUT" : "POST";

      // Preparar los datos a enviar
    const alertaData = {
        ...alerta,
        criptomoneda: alerta.criptomoneda,
        condicion: alerta.condicion,
        userId: userId,
        estado: esEdicion ? alerta.estado : "pendiente",
        precio_actual: precioActual || 0,
        precio_objetivo: alerta.precio_objetivo
      };
  
      // en creacion añadimos la fecha de creacion 
      if (!esEdicion) {
        alertaData.creado = new Date().toISOString();
      } 
      console.log("alerta: "+ alertaData.criptomoneda +"; condicion: "+ alerta.condicion +"; user_id: "+alertaData.userId +"; estado: "+alertaData.estado+"; precio_actual: "+alertaData.precio_actual+"; precio_objetivo: "+ alertaData.precio_objetivo+"; creado: "+alertaData.creado);
  
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alertaData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${esEdicion ? "actualizando" : "creando"} alerta`);
      }

      // Redirigir a la página de alertas después de guardar
      router.push("/alertas");
      
    } catch (err) {
      console.error("Error guardando alerta:", err);
      setError(err instanceof Error ? err.message : "Error al guardar la alerta");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    router.push("/alertas");
  };

  // Función type-safe para manejar cambios en los inputs
  const handleInputChange = (field: keyof Alerta, value: string | number) => {
    setAlerta(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función específica para el select de criptomoneda
  const handleCriptomonedaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAlerta(prev => ({
      ...prev,
      criptomoneda: e.target.value
    }));
  };

  // Función específica para el input de precio
  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setAlerta(prev => ({
      ...prev,
      precio_objetivo: value
    }));
  };

  // Iconos
  const IconArrowUp = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  );

  const IconArrowDown = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );

  const IconPrice = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  if (loading && esEdicion) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-custom-background text-custom-foreground">
          <MenuPrincipal />
          <main className="container mx-auto p-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-accent mx-auto"></div>
                <p className="mt-4 text-custom-text">Cargando alerta...</p>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-custom-background text-custom-foreground">
        <MenuPrincipal />
        
        <main className="container mx-auto p-4">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-custom-text">
                {esEdicion ? "Editar Alerta" : "Nueva Alerta"}
              </h1>
              <p className="text-custom-text-secondary mt-2">
                {esEdicion 
                  ? "Modifica los datos de tu alerta" 
                  : "Configura una nueva alerta de precio"}
              </p>
            </div>

            {/* Información de precio actual */}
            {precioActual && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">Precio actual de {alerta.criptomoneda}:</span>
                  <span className="text-blue-800 font-bold text-lg">
                    ${precioActual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
              </div>
            )}

            {/* Mostrar error si existe */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6 bg-custom-surface p-6 rounded-lg border border-custom-border">
              
              {/* Campo: Criptomoneda */}
              <div>
                <label htmlFor="criptomoneda" className="block text-sm font-medium text-custom-text-secondary mb-2">
                  Criptomoneda
                </label>
                <select
                  id="criptomoneda"
                  value={alerta.criptomoneda}
                  onChange={handleCriptomonedaChange}
                  className="w-full bg-custom-background border border-custom-border rounded-lg px-3 py-2 text-custom-text focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent"
                  disabled={esEdicion} // No permitir cambiar la criptomoneda en edición
                >
                  <option value="">Selecciona una criptomoneda</option>
                  {criptomonedas.map((crypto) => (
                    <option key={crypto} value={crypto}>
                      {crypto}
                    </option>
                  ))}
                </select>
                {esEdicion && (
                  <p className="text-xs text-custom-text-secondary mt-1">
                    No se puede modificar la criptomoneda en una alerta existente
                  </p>
                )}
              </div>

              {/* Campo: Condición */}
              <div>
                <label className="block text-sm font-medium text-custom-text-secondary mb-2">
                  Condición
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleInputChange("condicion", "por encima de")}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-all duration-200 ${
                      alerta.condicion === "por encima de"
                        ? "bg-green-100 border-green-300 text-green-800 ring-2 ring-green-200"
                        : "bg-custom-background border-custom-border text-custom-text hover:bg-gray-50"
                    }`}
                  >
                    <IconArrowUp />
                    <span>Por encima de</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("condicion", "por debajo de")}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border transition-all duration-200 ${
                      alerta.condicion === "por debajo de"
                        ? "bg-red-100 border-red-300 text-red-800 ring-2 ring-red-200"
                        : "bg-custom-background border-custom-border text-custom-text hover:bg-gray-50"
                    }`}
                  >
                    <IconArrowDown />
                    <span>Por debajo de</span>
                  </button>
                </div>
              </div>

              {/* Campo: Precio Objetivo */}
              <div>
                <label htmlFor="precio_objetivo" className="block text-sm font-medium text-custom-text-secondary mb-2">
                  Precio Objetivo (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IconPrice />
                  </div>
                  <input
                    type="number"
                    id="precio_objetivo"
                    step="0.000001"
                    min="0"
                    value={alerta.precio_objetivo || ""}
                    onChange={handlePrecioChange}
                    className="w-full bg-custom-background border border-custom-border rounded-lg pl-10 pr-3 py-2 text-custom-text focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-custom-text-secondary mt-1">
                  El precio al que quieres recibir la alerta
                </p>
              </div>

              {/* Botones */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancelar}
                  disabled={loading}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-custom-accent hover:bg-custom-accent-hover disabled:bg-custom-accent/50 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {esEdicion ? "Actualizando..." : "Creando..."}
                    </>
                  ) : (
                    esEdicion ? "Actualizar Alerta" : "Crear Alerta"
                  )}
                </button>
              </div>
            </form>

            {/* Información adicional */}
            <div className="mt-6 bg-custom-surface p-4 rounded-lg border border-custom-border">
              <h3 className="font-semibold text-custom-text mb-2">¿Cómo funcionan las alertas?</h3>
              <p className="text-custom-text-secondary text-sm">
                Recibirás una notificación cuando el precio de {alerta.criptomoneda || "la criptomoneda"} 
                {alerta.condicion === "por encima de" ? " supere" : " esté por debajo de"} 
                {" "}${alerta.precio_objetivo ? alerta.precio_objetivo.toLocaleString() : "tu precio objetivo"}.
              </p>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}