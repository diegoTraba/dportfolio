"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CampoContrasenia from "@/components/controles/CampoContrasenia";
import Aviso from "@/components/controles/Aviso";
import Boton from "@/components/controles/Boton";
import {LoginResponse} from '@/interfaces/comun.types'

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [estaMonitoreando, setEstaMonitoreando] = useState(false);
  const router = useRouter();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      // 1. Iniciar sesión
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data: LoginResponse & { error?: string } = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }
  
      const token = data.token;
      const userId = data.usuario.id;
      const ultimoAcceso = data.usuario.ultimoAcceso || null;
  
      // Guardar datos básicos del usuario
      localStorage.setItem("authToken", token);
      localStorage.setItem("estaLogueado", "true");
      localStorage.setItem("correoUsuario", data.usuario.email);
      localStorage.setItem("idUsuario", userId);
      localStorage.setItem("nombreUsuario", data.usuario.nombre);
      localStorage.setItem("ultimoAcceso", ultimoAcceso || "");
  
      console.log("✅ Login exitoso, token guardado");
  
      // 2. Iniciar servicioMonitoreo precios. 
      // iniciar-monitoreo-compras incia un cronojob que cada intervaloMS ejecuta un metodo que actualiza las compras del usuario logueado desde ultimoAcceso 
      // y actualiza la fecha de ultimoAcceso en el usuario
      const responseMonitoreo = await fetch(`${BACKEND_URL}/api/usuario/iniciar-monitoreo-compras`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ultimoAcceso: ultimoAcceso,
          userId:userId,
          intervaloMs: 300000 // 5 minutos
        })
      });

      const dataMonitoreo = await responseMonitoreo.json();
      
      if (dataMonitoreo.success) {
        setEstaMonitoreando(dataMonitoreo.monitoreoActivo);
        console.log('Monitoreo de compras iniciado');
      }

      // 3. Redirigir al dashboard
      router.push("/portfolio");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("Error al iniciar sesión: " + err.message);
      } else {
        setError("Error al iniciar sesión: Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && <Aviso tipo="error" mensaje={error} />}

      <div>
        <label className="block text-sm font-medium mb-2 text-custom-foreground">
          Email
        </label>
        <input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-custom-background border border-custom-card rounded-md text-custom-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-custom-foreground">
          Contraseña
        </label>
        <CampoContrasenia
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
        />
      </div>

      <Boton
        type="submit"
        texto={loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        loading={loading}
        disabled={loading}
        tamaño="grande"
        className="w-full"
      />
    </form>
  );
}
