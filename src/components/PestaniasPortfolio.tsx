// components/PestaniasPortfolio.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface Pestania {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface PestaniasPortfolioPropiedades {
  pestanias: Pestania[];
}

export const PestaniasPortfolio = ({ pestanias }: PestaniasPortfolioPropiedades) => {
  const pathname = usePathname();

  // Función mejorada para detectar pestaña activa
  const getActiveTab = () => {
    const normalizedPathname = pathname.replace(/\/+$/, '');
    
    // Buscar coincidencia exacta primero
    const exactMatch = pestanias.find(pestania => 
      normalizedPathname === pestania.path.replace(/\/+$/, '')
    );
    if (exactMatch) return exactMatch.id;

    // Si no hay coincidencia exacta, buscar por prefijo (para rutas anidadas)
    const prefixMatch = pestanias.find(pestania => 
      normalizedPathname.startsWith(pestania.path.replace(/\/+$/, '') + '/')
    );
    if (prefixMatch) return prefixMatch.id;

    return pestanias[0].id;
  };

  const activeTab = getActiveTab();

  return (
    <div className="border-b border-[var(--colorTerciario)] bg-custom-header">
      <nav className="flex space-x-8" aria-label="Pestanias">
        {pestanias.map((pestania) => (
          <Link
            key={pestania.id}
            href={pestania.path}
            className={`${
              activeTab === pestania.id
                ? 'border-[var(--colorTerciario)] text-[var(--colorTerciario)] font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200`}
          >
            {pestania.icon && <span className="mr-2">{pestania.icon}</span>}
            <span>{pestania.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};