// rigsite-fixed/src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rigquiropráctico",
  description: "Agenda tu atención quiropráctica en Copiapó",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        {/* Definimos window.RIGBOT_CLIENT_ID ANTES de cargar el widget. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.RIGBOT_CLIENT_ID = "demo-client";`, 
            // Para tus pruebas en rigsite-web.vercel.app, "demo-client" está bien.
            // Si esta página fuera a mostrarse para un cliente específico autenticado, 
            // aquí podrías inyectar dinámicamente el ID de ese cliente.
          }}
        />
        {/* Cargamos el widget DESDE LA CARPETA PUBLIC DE ESTE MISMO PROYECTO (rigsite-fixed) */}
        <script
          src="/rigbot-widget.js" // Ruta relativa a la raíz del sitio rigsite-web
          defer
        ></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-white shadow px-4 py-2 mb-4">
          <Link href="/client" className="text-blue-600 underline text-sm hover:text-blue-800 mr-4">
            Panel Cliente
          </Link>
          <Link href="/logs" className="text-blue-600 underline text-sm hover:text-blue-800">
            Visor de Logs (Demo)
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}