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
      <body className="bg-custom-background text-custom-foreground transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}