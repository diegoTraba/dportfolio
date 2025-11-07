import MenuPrincipal from '@/components/MenuPrincipal'
import ProtectedRoute from '@/components/ContenidoPrivado'
import SwitchTema from '@/components/controles/SwitchTema'

export default function Configuracion() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-custom-background text-custom-foreground">
        <MenuPrincipal />
  
        <main className="container mx-auto p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Configuración</h1>
            
            {/* Sección de Preferencias Generales */}
            <div className="bg-custom-card p-6 rounded-lg border border-custom-card shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Preferencias Generales</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Modo Oscuro</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Activar o desactivar el modo oscuro
                    </p>
                  </div>
                  <SwitchTema />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Moneda Principal</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Moneda base para mostrar los balances
                    </p>
                  </div>
                  <select className="bg-custom-background border border-custom-card rounded-lg px-3 py-2 text-sm">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>BTC</option>
                    <option>ETH</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección de Notificaciones */}
            <div className="bg-custom-card p-6 rounded-lg border border-custom-card shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Notificaciones</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alertas por Email</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Recibir notificaciones por correo electrónico
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notificaciones Push</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Recibir notificaciones en el navegador
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Alertas de Precio</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Notificaciones cuando los precios alcancen ciertos niveles
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección de Seguridad */}
            <div className="bg-custom-card p-6 rounded-lg border border-custom-card shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Seguridad</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Cambiar Contraseña</h3>
                  <div className="space-y-3 max-w-md">
                    <input 
                      type="password" 
                      placeholder="Contraseña actual" 
                      className="w-full bg-custom-background border border-custom-card rounded-lg px-3 py-2 text-sm"
                    />
                    <input 
                      type="password" 
                      placeholder="Nueva contraseña" 
                      className="w-full bg-custom-background border border-custom-card rounded-lg px-3 py-2 text-sm"
                    />
                    <input 
                      type="password" 
                      placeholder="Confirmar nueva contraseña" 
                      className="w-full bg-custom-background border border-custom-card rounded-lg px-3 py-2 text-sm"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors text-sm">
                      Cambiar Contraseña
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}