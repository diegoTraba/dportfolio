import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DPortfolio',
  description: 'Gestiona tus inversiones en criptomonedas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}