"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserId } from "@/hooks/useUserId";
import Boton from "@/components/controles/Boton";

export default function Ventas() {
  const userId = useUserId();
  const navegador = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  return (
    <>
      <main className="container mx-auto p-4">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl title-custom-foreground">Ventas</h1>
        </div>
      </main>
    </>
  );
}
