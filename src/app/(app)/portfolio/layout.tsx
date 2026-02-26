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
  {
    id: 'ventas',
    label: 'Ventas',
    path: '/portfolio/ventas',
  },
  {
    id: 'botS',
    label: 'Bot señales',
    path: '/portfolio/bots',
  },
  {
    id: 'graficos',
    label: 'Graficos',
    path: '/portfolio/graficos',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-custom-background">
      {/* Contenedor fijo con backdrop-filter para asegurar opacidad */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-custom-header/95 backdrop-blur-sm">
        {/* <div className="container mx-auto"> */}
          <PestaniasPortfolio pestanias={pestanias} />
        {/* </div> */}
      </div>
      
      {/* Contenido principal */}
      <div className="container mx-auto py-6 pt-16">
        {children}
      </div>
    </div>
  );
}