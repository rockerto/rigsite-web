import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // <-- necesario para que <Link /> funcione

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
        <script
          src="https://rigbot-product.vercel.app/rigbot-widget.js"
          defer
        ></script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <nav className="bg-white shadow px-4 py-2 mb-4">
          <Link href="/logs" className="text-blue-600 underline text-sm hover:text-blue-800">
            Visor de Logs
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
