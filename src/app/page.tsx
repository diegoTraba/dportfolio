import Auth from "@/components/Auth";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-custom-background text-custom-foreground flex items-center justify-center p-4">
      <div className="bg-custom-surface p-8 rounded-lg shadow-lg max-w-md w-full border border-custom-card">
        <div className="flex justify-center mb-6">
          <Image
            src="/img/logo_DPortfolio.png"
            alt="DPortfolio"
            width={150}
            height={100}
            className="w-auto"
            priority
          />
        </div>
        <Auth />
        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link
            href="/recuperar-contrasenia"
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}
