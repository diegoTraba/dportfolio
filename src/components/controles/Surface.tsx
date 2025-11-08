// components/Surface.tsx
import React from 'react';

interface SurfaceProps {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
}

export default function Surface({ titulo, descripcion, children }: SurfaceProps) {
  return (
    <div className="bg-custom-surface p-6 rounded-lg border border-custom-card shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{titulo}</h2>
      {descripcion && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">{descripcion}</p>
      )}
      <div>{children}</div>
    </div>
  );
}