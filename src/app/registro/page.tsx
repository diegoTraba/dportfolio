"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CampoContrasenia from "@/components/controles/CampoContrasenia";
import { validarEmail, validarContrasenia } from "@/lib/Validaciones";
import Aviso from "@/components/controles/Aviso";
import {LoginResponse} from '@/interfaces/comun.types'

export default function Registro() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [serverError, setServerError] = useState("");

  const router = useRouter();

  const passwordValidation = validarContrasenia(password);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setServerError("");

    // Validaciones del frontend
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!validarEmail(email)) {
      newErrors.email = "Formato de email inválido";
    }

    if (!passwordValidation.isValid) {
      newErrors.password = "La contraseña no cumple los requisitos";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Verificar si el usuario ya existe
      const { data: existingUser, error: checkError } = await supabase
        .from("usuarios")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        setServerError("Ya existe un usuario con este email");
        setLoading(false);
        return;
      }

      // Hash de la contraseña
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crear el usuario
      const { data: newUser, error: insertError } = await supabase
        .from("usuarios")
        .insert([
          {
            email: email,
            nombre: name,
            password: hashedPassword,
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      // Enviar email de bienvenida
      const { enviarEmailAlta } = await import("@/lib/email/accionesEmail");
      await enviarEmailAlta(email, name, password);

      // Registro exitoso - redirigir al login
      alert(
        "Registro exitoso! Se ha enviado un correo con tus credenciales. Ya puedes iniciar sesión"
      );
      router.push("/");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as { message: string };
        setServerError("Error en el registro: " + error.message);
      } else {
        setServerError("Error en el registro: Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-custom-background text-custom-foreground flex items-center justify-center p-4">
      <div className="bg-custom-card border border-custom-border p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Registro</h1>

        {serverError && (
          <Aviso tipo="error" mensaje={serverError} className="mb-4" />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-custom-foreground">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-custom-surface border border-custom-border rounded-md text-custom-foreground focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-custom-foreground">
              Email
            </label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 bg-custom-surface border rounded-md text-custom-foreground focus:outline-none focus:ring-2 focus:ring-custom-accent focus:border-transparent transition-all duration-200 ${
                errors.email ? "border-red-500" : "border-custom-border"
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-custom-foreground">
              Contraseña
            </label>
            <CampoContrasenia
              value={password}
              onChange={setPassword}
              placeholder="Contraseña"
              error={errors.password}
            />

            {/* Indicadores de requisitos de contraseña */}
            <div className="mt-2 text-xs text-custom-foreground opacity-70">
              <p>La contraseña debe tener:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li
                  className={
                    passwordValidation.requirements.minLength
                      ? "text-green-500"
                      : "text-current"
                  }
                >
                  Al menos 6 caracteres
                </li>
                <li
                  className={
                    passwordValidation.requirements.upperCase
                      ? "text-green-500"
                      : "text-current"
                  }
                >
                  Una mayúscula
                </li>
                <li
                  className={
                    passwordValidation.requirements.lowerCase
                      ? "text-green-500"
                      : "text-current"
                  }
                >
                  Una minúscula
                </li>
                <li
                  className={
                    passwordValidation.requirements.number
                      ? "text-green-500"
                      : "text-current"
                  }
                >
                  Un número
                </li>
                <li
                  className={
                    passwordValidation.requirements.symbol
                      ? "text-green-500"
                      : "text-current"
                  }
                >
                  Un símbolo
                </li>
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-custom-foreground">
              Confirmar Contraseña
            </label>
            <CampoContrasenia
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repite tu contraseña"
              error={errors.confirmPassword}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-custom-accent hover:bg-custom-accent-hover text-white py-2 px-4 rounded-md font-semibold disabled:opacity-50 transition-all duration-200"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-custom-foreground opacity-70">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/"
              className="text-custom-accent hover:text-custom-accent-hover font-medium transition-colors duration-200"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
