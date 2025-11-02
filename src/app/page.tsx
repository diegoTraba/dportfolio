import Link from 'next/link';

export default function Home() {
  //login simple
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">DPortfolio</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
              placeholder="tu@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"
              placeholder="••••••••"
            />
          </div>
          
          <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-md font-semibold">
            Iniciar Sesión
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
            Login (demo)
          </Link>
        </div>
      </div>
    </div>
  );
}