"use client";

import { useState, useEffect, useCallback} from "react";
import { useUserId } from "@/hooks/useUserId";
import { useRouter } from "next/navigation";
import TarjetaAlerta from "@/components/controles/alertas/TarjetaAlerta";
import { IconoMas } from "@/components/controles/Iconos";
import { Alerta } from "@/interfaces/comun.types";
import BotonPersonalizado from "@/components/controles/Boton"; // Importar el componente Boton

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useUserId();
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Metodo para cargar las alertas - memoizado con useCallback
  const cargarAlertas = useCallback(async () => {
    try {
      setLoading(true);

      if (!userId) {
        setError("Usuario no autenticado");
        setLoading(false);
        return;
      }

      // endpoint que devuelve las alertas del usuario
      const response = await fetch(`${BACKEND_URL}/api/alertas/${userId}`);

      if (!response.ok) {
        throw new Error("Error al cargar las alertas");
      }

      //obtenemos las alertas de la api, las guardamos en el estado de alertas y ponemos el estado de errores a null
      const data = await response.json();
      setAlertas(data);
      setError(null);

    } catch (err) {
      console.error("Error cargando alertas:", err);
      setError("No se pudieron cargar las alertas");
    } finally {
      setLoading(false);
    }
  }, [userId, BACKEND_URL]); // Dependencias de useCallback

  // Cargar alertas al montar el componente o cuando cambie cargarAlertas
  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]); // Ahora solo depende de cargarAlertas, que es memoizado

  // Metodo para reactivar una alerta concreta
  const handleReactivarAlerta = async (id: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/alertas/${id}/reactivar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al reactivar la alerta");
      }

      // Actualizar el estado local de las alertas
      setAlertas(
        alertas.map((alerta) =>
          alerta.id === id
            ? {
                ...alerta,
                estado: "pendiente",
                activado: undefined,
                precio_actual: undefined,
              }
            : alerta
        )
      );
    } catch (err) {
      console.error("Error reactivando alerta:", err);
      setError("Error al reactivar la alerta");
    }
  };

  // Metodo para eliminar una alerta concreta
  const handleEliminarAlerta = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta alerta?")) {
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/alertas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la alerta");
      }

      // Actualizar el estado local de las alertas
      setAlertas(alertas.filter((alerta) => alerta.id !== id));
    } catch (err) {
      console.error("Error eliminando alerta:", err);
      setError("Error al eliminar la alerta");
    }
  };

  // Metodo para navegar al formulario de edición
  const handleEditarAlerta = (alerta: Alerta) => {
    router.push(`/alertas/editarAlerta?id=${alerta.id}`);
  };

  // Metodo para navegar al formulario de creación
  const handleNuevaAlerta = () => {
    router.push("/alertas/editarAlerta");
  };

  // Render loading
  if (loading) {
    return (
      <>
        <main className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-accent mx-auto"></div>
              <p className="mt-4 text-custom-text">Cargando alertas...</p>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Render de la pagina
  return (
    <>
      <main className="container mx-auto p-4">
        <div className="flex flex-col space-y-6">
          {/* Header con título y botón */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold title-custom-foreground">
                Alertas Cripto
              </h1>
              <p className="text-custom-text-secondary mt-2">
                Gestiona tus alertas de precios de criptomonedas
              </p>
            </div>
            {/* Botón de añadir nueva alerta - usa valores por defecto */}
            <BotonPersonalizado
              texto={
                <div className="flex items-center space-x-2">
                  <IconoMas />
                  <span>Alerta</span>
                </div>
              }
              onClick={handleNuevaAlerta}
              tamaño="grande"
              className="shadow-md flex items-center space-x-2"
            />
          </div>

          {/* Mostrar error si existe */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
              <BotonPersonalizado
                texto="Reintentar"
                onClick={cargarAlertas}
                colorFondo="#ef4444"
                colorHover="#dc2626"
                colorTexto="white"
                tamaño="pequeno"
                className="mt-2"
              />
            </div>
          )}

          {/* Surface con las tarjetas de alertas */}
          <div className="bg-custom-surface p-6 rounded-lg shadow-lg border border-custom-border">
            <div className="mb-6">
              <h2 className="text-xl title-custom-foreground">
                Alertas Configuradas
              </h2>
              <p className="text-custom-text-secondary text-sm mt-1">
                Todas tus alertas activas y pendientes aparecerán aquí
              </p>
            </div>

            {/* Repeater de tarjetas usando el componente TarjetaAlerta */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alertas.map((alerta) => (
                <TarjetaAlerta
                  key={alerta.id}
                  alerta={alerta}
                  onEditar={handleEditarAlerta}
                  onReactivar={handleReactivarAlerta}
                  onEliminar={handleEliminarAlerta}
                />
              ))}
            </div>

            {/* Mensaje cuando no hay alertas */}
            {alertas.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-custom-text-secondary">
                  No tienes alertas configuradas. ¡Crea tu primera alerta!
                </p>
              </div>
            )}
          </div>

          {/* Información adicional */}
          <div className="bg-custom-surface p-4 rounded-lg border border-custom-border">
            <h3 className="font-semibold text-custom-text mb-2">
              ¿Cómo funcionan las alertas?
            </h3>
            <p className="text-custom-text-secondary text-sm">
              Recibirás una notificación cuando el precio de la criptomoneda
              alcance el objetivo establecido. Las alertas se marcan como
              activas cuando se disparan y puedes reactivarlas para continuar
              monitoreando.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
