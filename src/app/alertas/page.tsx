import MenuPrincipal from '@/components/MenuPrincipal'
import ProtectedRoute from '@/components/ContenidoPrivado'

export default function Alertas() {
  return (
    <ProtectedRoute>
        <div className="min-h-screen bg-custom-background text-custom-foreground">
        <MenuPrincipal />
        
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Alertas</h1>
                <div className="bg-bg-bg-custom-surface p-6 rounded-lg">
                    <p className="text-gray-400">Aquí irán tus alertas de precios</p>
                </div>
            </main>
        </div>
    </ProtectedRoute>
  )
}