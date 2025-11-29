// app/configuracion/page.tsx
"use client";

import { useState, useEffect } from "react";
import SwitchTema from "@/components/controles/SwitchTema";
import Boton from "@/components/controles/Boton";
import CampoContrasenia from "@/components/controles/CampoContrasenia";
import Aviso from "@/components/controles/Aviso";
import { useUserId } from "@/hooks/useUserId";
import { supabase } from "@/lib/supabase";
import { validarContrasenia } from "@/lib/Validaciones";

/**
 * INTERFACES PARA TIPADO
 *
 * UserPreferences: Define la estructura de las preferencias del usuario
 * que se guardan en la base de datos
 */
interface UserPreferences {
  email_notification: boolean; // Notificaciones por email
  push_notification: boolean; // Notificaciones push del navegador
  main_currency: string; // Moneda principal (USD, EUR, BTC)
}

export default function Configuracion() {
  // ===========================================================================
  // ESTADOS Y HOOKS
  // ===========================================================================

  // Obtener el ID del usuario desde el contexto de autenticación
  const userId = useUserId();

  // Estados para el formulario de cambio de contraseña
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<{
    tipo: "exito" | "error";
    texto: string;
  } | null>(null);
  const [errors, setErrors] = useState<{
    contraseniaActual?: string;
    nuevaContrasenia?: string;
    confirmarContrasenia?: string;
  }>({});

  // Datos del formulario de contraseña
  const [formData, setFormData] = useState({
    contraseniaActual: "",
    nuevaContrasenia: "",
    confirmarContrasenia: "",
  });

  // Estados para las preferencias del usuario
  const [loadingPreferences, setLoadingPreferences] = useState(true);
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notification: true, // Valor por defecto
    push_notification: true, // Valor por defecto
    main_currency: "USD", // Valor por defecto
  });

  // Validación en tiempo real de la nueva contraseña
  const passwordValidation = validarContrasenia(formData.nuevaContrasenia);

  // ===========================================================================
  // EFECTOS (useEffect)
  // ===========================================================================

  /**
   * EFFECT: Cargar preferencias del usuario al montar el componente
   *
   * Este efecto se ejecuta cuando:
   * - El componente se monta por primera vez
   * - El userId cambia (cuando el usuario inicia sesión)
   *
   * Consulta la base de datos para obtener las preferencias guardadas del usuario
   */
  useEffect(() => {
    const loadUserPreferences = async () => {
      // Si no hay usuario autenticado, no hacer nada
      if (!userId) return;

      try {
        setLoadingPreferences(true);

        // Consultar la base de datos para obtener las preferencias del usuario
        const { data: user, error } = await supabase
          .from("users")
          .select("email_notification, push_notification, main_currency")
          .eq("id", userId)
          .single(); // Obtener un solo registro (el usuario actual)

        if (error) throw error;

        // Si se encontró el usuario, actualizar el estado con sus preferencias
        if (user) {
          setPreferences({
            email_notification: user.email_notification ?? true, // Si es null, usar true
            push_notification: user.push_notification ?? true, // Si es null, usar true
            main_currency: user.main_currency || "USD", // Si es null/empty, usar 'USD'
          });
        }
      } catch (error) {
        console.error("Error cargando preferencias:", error);
        setMensaje({
          tipo: "error",
          texto: "Error al cargar las preferencias",
        });
      } finally {
        // Siempre quitar el estado de carga, incluso si hay error
        setLoadingPreferences(false);
      }
    };

    loadUserPreferences();
  }, [userId]); // Dependencia: se ejecuta cuando userId cambia

  // ===========================================================================
  // FUNCIONES PARA MANEJAR PREFERENCIAS
  // ===========================================================================

  /**
   * FUNCIÓN: Actualizar una preferencia del usuario en la base de datos
   *
   * Esta función se llama cuando el usuario cambia un switch o selector
   * Actualiza tanto el estado local como la base de datos
   *
   * @param field - Campo a actualizar (ej: 'email_notification')
   * @param value - Nuevo valor (boolean para switches, string para select)
   */
  const updatePreference = async (
    field: keyof UserPreferences,
    value: boolean | string
  ) => {
    // Si no hay usuario autenticado, no hacer nada
    if (!userId) return;

    try {
      setLoadingPreferences(true);

      // Actualizar el campo específico en la base de datos
      const { error } = await supabase
        .from("users")
        .update({ [field]: value }) // Campo dinámico con el valor nuevo
        .eq("id", userId); // Solo actualizar el usuario actual

      if (error) throw error;

      // ACTUALIZAR ESTADO LOCAL: Optimistic update
      // Actualizamos inmediatamente la UI para mejor experiencia de usuario
      setPreferences((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Mostrar mensaje de éxito
      setMensaje({
        tipo: "exito",
        texto: "Preferencias actualizadas correctamente",
      });

      // Limpiar mensaje después de 3 segundos automáticamente
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error("Error actualizando preferencia:", error);
      setMensaje({
        tipo: "error",
        texto: "Error al actualizar las preferencias",
      });

      // REVERTIR CAMBIO: Si hay error, volver al estado anterior
      // Esto evita que la UI quede en un estado inconsistente
      setPreferences((prev) => ({
        ...prev,
        [field]: !value, // Revertir al valor anterior
      }));
    } finally {
      // Siempre quitar el estado de carga
      setLoadingPreferences(false);
    }
  };

  // ===========================================================================
  // FUNCIONES PARA MANEJAR CAMBIO DE CONTRASEÑA
  // ===========================================================================

  /**
   * FUNCIÓN: Manejar cambios en los campos del formulario de contraseña
   *
   * Actualiza el estado del formulario y limpia errores cuando el usuario escribe
   *
   * @param field - Campo que cambió
   * @param value - Nuevo valor del campo
   */
  const handleChange = (field: string, value: string) => {
    // Actualizar el campo específico en el estado del formulario
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // LIMPIAR ERRORES: Cuando el usuario empiece a escribir en un campo con error,
    // quitamos el mensaje de error para dar feedback inmediato
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  /**
   * FUNCIÓN: Manejar envío del formulario de cambio de contraseña
   *
   * Esta función:
   * 1. Valida los datos en el frontend
   * 2. Verifica la contraseña actual
   * 3. Hashea la nueva contraseña
   * 4. Actualiza en la base de datos
   * 5. Envía email de confirmación
   *
   * @param e - Evento del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir envío tradicional del formulario

    // Verificar que hay un usuario autenticado
    if (!userId) {
      setMensaje({
        tipo: "error",
        texto: "No se encontró la sesión del usuario",
      });
      return;
    }

    // Preparar estados para el proceso
    setLoading(true);
    setMensaje(null);
    setErrors({});

    try {
      // =======================================================================
      // VALIDACIONES EN FRONTEND
      // =======================================================================
      const newErrors: typeof errors = {};

      // Validar que todos los campos estén completos
      if (!formData.contraseniaActual) {
        newErrors.contraseniaActual = "La contraseña actual es obligatoria";
      }

      if (!formData.nuevaContrasenia) {
        newErrors.nuevaContrasenia = "La nueva contraseña es obligatoria";
      } else if (!passwordValidation.isValid) {
        newErrors.nuevaContrasenia =
          "La nueva contraseña no cumple los requisitos";
      }

      if (!formData.confirmarContrasenia) {
        newErrors.confirmarContrasenia = "Debes confirmar la nueva contraseña";
      } else if (formData.nuevaContrasenia !== formData.confirmarContrasenia) {
        newErrors.confirmarContrasenia = "Las contraseñas no coinciden";
      }

      // Si hay errores de validación, mostrarlos y detener el proceso
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // =======================================================================
      // VERIFICAR CONTRASEÑA ACTUAL
      // =======================================================================

      // Obtener datos completos del usuario desde la base de datos
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userError || !user) {
        throw new Error("Usuario no encontrado");
      }

      // Comparar la contraseña actual con el hash guardado en la base de datos
      const bcrypt = await import("bcryptjs"); // Import dinámico para reducir bundle
      const esContraseniaValida = await bcrypt.compare(
        formData.contraseniaActual,
        user.password
      );

      // Si la contraseña actual no coincide, mostrar error
      if (!esContraseniaValida) {
        setErrors({ contraseniaActual: "La contraseña actual es incorrecta" });
        setLoading(false);
        return;
      }

      // =======================================================================
      // ACTUALIZAR CONTRASEÑA EN BASE DE DATOS
      // =======================================================================

      // Hashear la nueva contraseña con salt rounds 12 (seguro y rápido)
      const hashedPassword = await bcrypt.hash(formData.nuevaContrasenia, 12);

      // Actualizar el campo password en la base de datos
      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedPassword })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      // =======================================================================
      // ENVIAR EMAIL DE NOTIFICACIÓN
      // =======================================================================

      // Importar y ejecutar la función para enviar email de confirmación
      const { enviarEmailCambioContrasenia } = await import(
        "@/lib/email/accionesEmail"
      );
      await enviarEmailCambioContrasenia(
        user.email,
        user.name,
        formData.nuevaContrasenia
      );

      // =======================================================================
      // ÉXITO - MOSTRAR MENSAJE Y LIMPIAR FORMULARIO
      // =======================================================================
      setMensaje({
        tipo: "exito",
        texto:
          "Contraseña actualizada correctamente. Se ha enviado un email de confirmación.",
      });

      // Limpiar todos los campos del formulario
      setFormData({
        contraseniaActual: "",
        nuevaContrasenia: "",
        confirmarContrasenia: "",
      });
    } catch (err: unknown) {
      // =======================================================================
      // MANEJO DE ERRORES
      // =======================================================================
      console.error("Error cambiando contraseña:", err);

      // Extraer mensaje de error de forma segura
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as { message: string };
        setMensaje({
          tipo: "error",
          texto: "Error al cambiar la contraseña: " + error.message,
        });
      } else {
        setMensaje({ tipo: "error", texto: "Error interno del servidor" });
      }
    } finally {
      // Siempre quitar el estado de carga, tanto en éxito como en error
      setLoading(false);
    }
  };

  // ===========================================================================
  // RENDERIZADO DE LA PÁGINA
  // ===========================================================================
  return (
    <>
      <main className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Configuración</h1>

          {/* 
              MENSAJE GLOBAL 
              Se muestra para éxito/error de cualquier operación
              Se auto-elimina después de 3 segundos en caso de éxito
            */}
          {mensaje && (
            <Aviso
              tipo={mensaje.tipo === "exito" ? "exito" : "error"}
              mensaje={mensaje.texto}
              className="mb-6"
            />
          )}

          {/* 
              SECCIÓN: PREFERENCIAS GENERALES 
              Configuraciones de apariencia y moneda
            */}
          <div className="bg-custom-card p-6 rounded-lg border border-custom-card shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">
              Preferencias Generales
            </h2>

            <div className="space-y-4">
              {/* Switch para modo oscuro/claro */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Modo Oscuro</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Activar o desactivar el modo oscuro
                  </p>
                </div>
                <SwitchTema />
              </div>

              {/* Selector de moneda principal */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Moneda Principal</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Moneda base para mostrar los balances
                  </p>
                </div>
                <select
                  value={preferences.main_currency}
                  onChange={(e) =>
                    updatePreference("main_currency", e.target.value)
                  }
                  disabled={loadingPreferences}
                  className="bg-custom-background border border-custom-card rounded-lg px-3 py-2 text-sm disabled:opacity-50"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="BTC">BTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* 
              SECCIÓN: NOTIFICACIONES
              Configuración de tipos de notificaciones
            */}
          <div className="bg-custom-card p-6 rounded-lg border border-custom-card shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>

            <div className="space-y-4">
              {/* Switch: Alertas por Email */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Alertas por Email</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recibir notificaciones por correo electrónico
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.email_notification}
                    onChange={(e) =>
                      updatePreference("email_notification", e.target.checked)
                    }
                    disabled={loadingPreferences}
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${loadingPreferences ? "opacity-50 cursor-not-allowed" : ""}`}
                  ></div>
                </label>
              </div>

              {/* Switch: Notificaciones Push */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Notificaciones Push</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Recibir notificaciones en el navegador
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.push_notification}
                    onChange={(e) =>
                      updatePreference("push_notification", e.target.checked)
                    }
                    disabled={loadingPreferences}
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${loadingPreferences ? "opacity-50 cursor-not-allowed" : ""}`}
                  ></div>
                </label>
              </div>
            </div>
          </div>

          {/* 
              SECCIÓN: SEGURIDAD
              Cambio de contraseña del usuario
            */}
          <div className="bg-custom-card p-6 rounded-lg border border-custom-card shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-4">Seguridad</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Cambiar Contraseña</h3>

                {/* Formulario para cambio de contraseña */}
                <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
                  {/* Campo: Contraseña actual */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Contraseña actual
                    </label>
                    <CampoContrasenia
                      value={formData.contraseniaActual}
                      onChange={(value) =>
                        handleChange("contraseniaActual", value)
                      }
                      placeholder="Contraseña actual"
                      error={errors.contraseniaActual}
                    />
                  </div>

                  {/* Campo: Nueva contraseña */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nueva contraseña
                    </label>
                    <CampoContrasenia
                      value={formData.nuevaContrasenia}
                      onChange={(value) =>
                        handleChange("nuevaContrasenia", value)
                      }
                      placeholder="Nueva contraseña"
                      error={errors.nuevaContrasenia}
                    />

                    {/* 
                        INDICADORES DE REQUISITOS DE CONTRASEÑA
                        Se muestran en tiempo real mientras el usuario escribe
                        Cambian de color cuando se cumplen los requisitos
                      */}
                    {formData.nuevaContrasenia && (
                      <div className="mt-2 text-xs text-gray-400">
                        <p>La contraseña debe tener:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li
                            className={
                              passwordValidation.requirements.minLength
                                ? "text-green-400"
                                : ""
                            }
                          >
                            Al menos 6 caracteres
                          </li>
                          <li
                            className={
                              passwordValidation.requirements.upperCase
                                ? "text-green-400"
                                : ""
                            }
                          >
                            Una mayúscula
                          </li>
                          <li
                            className={
                              passwordValidation.requirements.lowerCase
                                ? "text-green-400"
                                : ""
                            }
                          >
                            Una minúscula
                          </li>
                          <li
                            className={
                              passwordValidation.requirements.number
                                ? "text-green-400"
                                : ""
                            }
                          >
                            Un número
                          </li>
                          <li
                            className={
                              passwordValidation.requirements.symbol
                                ? "text-green-400"
                                : ""
                            }
                          >
                            Un símbolo
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Campo: Confirmar nueva contraseña */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Confirmar nueva contraseña
                    </label>
                    <CampoContrasenia
                      value={formData.confirmarContrasenia}
                      onChange={(value) =>
                        handleChange("confirmarContrasenia", value)
                      }
                      placeholder="Confirmar nueva contraseña"
                      error={errors.confirmarContrasenia}
                    />
                  </div>

                  {/* Botón para enviar el formulario */}
                  <Boton
                    texto="Cambiar Contraseña"
                    type="submit"
                    tamaño="mediano"
                    loading={loading}
                    disabled={loading}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
