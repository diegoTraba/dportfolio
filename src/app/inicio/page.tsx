import MenuPrincipal from '@/components/MenuPrincipal'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function Inicio() {
    return (
      <ProtectedRoute>
      <div className="min-h-screen bg-gray-900 text-white">
        <MenuPrincipal />
  
        <main className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Tarjetas de resumen */}
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Balance Total</h3>
              <p className="text-2xl font-bold text-green-400">$0.00</p>
              <p className="text-sm text-gray-400">Conecta un exchange para empezar</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Exchanges Conectados</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Alertas Activas</h3>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
  
          {/* Sección para conectar exchanges */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Conectar Exchange</h2>
            <div className="flex space-x-4">
              <button className="bg-yellow-500 text-gray-900 px-4 py-2 rounded font-semibold">
                Conectar Binance
              </button>
              <button className="bg-purple-500 text-white px-4 py-2 rounded font-semibold" disabled>
                Conectar Kraken (próximamente)
              </button>
            </div>
          </div>
        </main>
      </div>
      </ProtectedRoute>
    );
  }