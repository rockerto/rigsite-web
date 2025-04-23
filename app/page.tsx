'use client';

import { useEffect, useState } from "react";

export default function Home() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    fetch("/api/data.json")
      .then((res) => res.json())
      .then(setInfo);
  }, []);

  if (!info) {
    return <div className="p-6 text-center">Cargando contenido...</div>;
  }

  return (
    <main className="min-h-screen bg-white text-gray-800 font-sans">
      <header className="bg-blue-700 text-white py-12 text-center shadow">
        <h1 className="text-4xl font-bold">{info.titulo}</h1>
        <p className="text-lg mt-2">{info.subtitulo}</p>
        <a
          href="https://rigquiropractico-spa.appointlet.com/"
          target="_blank"
          className="inline-block mt-6 px-6 py-2 bg-white text-blue-700 font-semibold rounded shadow hover:bg-gray-100 transition"
        >
          Reservar Hora
        </a>
      </header>

      <section className="max-w-5xl mx-auto py-12 px-6 grid gap-6 md:grid-cols-2">
        {info.servicios.map((servicio, i) => (
          <div
            key={i}
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow hover:shadow-md transition"
          >
            <h3 className="text-xl font-bold text-blue-700">{servicio.nombre}</h3>
            <p className="text-gray-600 mt-2">{servicio.descripcion}</p>
            <p className="font-bold mt-4 text-blue-800">{servicio.precio}</p>
          </div>
        ))}
      </section>

      <section className="bg-gray-100 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Contacto</h2>
        <p className="text-gray-600">{info.contacto}</p>
        <a
          href="https://wa.me/56989967350?text=Hola,%20quiero%20agendar%20una%20hora"
          target="_blank"
          className="inline-block mt-4 px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Hablar por WhatsApp
        </a>
      </section>
    </main>
  );
}
