import Auth from '@/components/Auth'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex justify-center mb-6">
          <Image 
            src="/img/logo_DPortfolio.png" 
            alt="DPortfolio" 
            width={150} 
            height={100}
            className="w-auto" // Ajusta la altura, el ancho se auto-ajusta
            priority // Para que cargue rápido en la página principal
          />
        </div>
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