//layout para las paginas de la zona privada con el menuPrincipal para no recargarlo cada vez que se cambia de pagina
import ProtectedRoute from "@/components/ContenidoPrivado";
import MenuPrincipal from "@/components/MenuPrincipal";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-custom-background text-custom-foreground">
        {/* Menú principal que se mantendrá en todas las páginas protegidas */}
        <MenuPrincipal />
        <div className="pt-22"> {/* Ajusta este valor según la altura de tu menú */}
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
