import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { UserProvider } from "@/context/UserContext"; 
import RigbotClientIdInjector from "@/components/RigbotClientIdInjector"; // Este es el componente modificado

const geistSans = Geist({ 
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ 
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rigquiropráctico | Panel Rigbot",
  description: "Administra tu asistente virtual Rigbot y agenda tu atención quiropráctica.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* YA NO CARGAMOS /rigbot-widget.js directamente aquí */}
        {/* <script src="/rigbot-widget.js" defer></script>  <--- ELIMINAR ESTA LÍNEA */}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProvider> 
          {/* RigbotClientIdInjector ahora se encarga de cargar el widget dinámicamente */}
          <RigbotClientIdInjector /> 
          
          <nav className="bg-white shadow px-4 py-2 mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
              Inicio
            </Link>
            <Link href="/client" className="text-blue-600 hover:text-blue-800 mr-4">
              Panel Cliente
            </Link>
            <Link href="/client/login" className="text-blue-600 hover:text-blue-800 mr-4">
              Login
            </Link>
          </nav>
          <main>{children}</main>
        </UserProvider>
      </body>
    </html>
  );
}