import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function TestDB() {
  // Consulta simple sin autenticación
  const { data: usuarios, error } = await supabase
    .from('usuarios')
    .select('*')
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Test Base de Datos Supabase</h1>
      
      {error ? (
        <div className="bg-red-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Error:</h2>
          <pre className="mt-2">{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">
            Conexión exitosa! Usuarios en BD: {usuarios?.length || 0}
          </h2>
          <pre className="bg-gray-700 p-4 rounded overflow-auto">
            {JSON.stringify(usuarios, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6">
        <Link href="/" className="text-blue-400 hover:text-blue-300">
          ← Volver al Login
        </Link>
      </div>
    </div>
  )
}