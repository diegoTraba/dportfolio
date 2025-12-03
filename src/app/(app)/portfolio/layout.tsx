// app/app/portfolio/layout.tsx
import { PestaniasPortfolio } from "@/components/PestaniasPortfolio";

const pestanias = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    path: '/portfolio',
  },
  {
    id: 'compras',
    label: 'Compras',
    path: '/portfolio/compras',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-custom-background">
      {/* Pestañas de navegación fijas */}
      <div className="fixed top-16 left-0 right-0 bg-custom-header">
        <div className="container mx-auto">
          <PestaniasPortfolio pestanias={pestanias} />
        </div>
      </div>
      
      {/* Contenido de la página con padding para compensar menú + pestañas */}
      <div className="container mx-auto py-6 pt-16"> {/* Ajustado para menú + pestañas */}
        {children}
      </div>
    </div>
  );
}