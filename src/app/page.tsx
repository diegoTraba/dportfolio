import Auth from '@/components/Auth'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">DPortfolio</h1>
        <Auth />
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-blue-400 hover:text-blue-300">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}