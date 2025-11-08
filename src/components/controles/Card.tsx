// components/Card.tsx
import React from 'react';

interface CardProps {
  titulo: string;
  contenido: {
    texto: string | React.ReactNode;
    color?: string;
    subtitulo?: string | React.ReactNode;
  };
  children?: React.ReactNode;
}

export default function Card({ titulo, contenido, children }: CardProps) {
  return (
    <div className="bg-custom-card p-6 rounded-lg border border-custom-card shadow-sm">
      <h3 className="text-lg font-semibold mb-2 text-custom-foreground">{titulo}</h3>
      <div 
        className="text-2xl font-bold"
        style={{ color: contenido.color }}
      >
        {contenido.texto}
      </div>
      {contenido.subtitulo && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {contenido.subtitulo}
        </div>
      )}
      {children}
    </div>
  );
}