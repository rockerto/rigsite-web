import './globals.css';

export const metadata = {
  title: "RigQuiropráctico",
  description: "Recupera tu movimiento, sin dolor, sin límites.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
