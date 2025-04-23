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
    return <div className="p-6 text-center">Cargando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-blue-700">{info.titulo}</h1>
        <p className="text-lg text-gray-600">{info.subtitulo}</p>
        <a
          href="https://rigquiropractico-spa.appointlet.com/"
          target="_blank"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Reservar Hora
        </a>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {info.servicios.map((servicio, i) => (
          <div key={i} className="border rounded p-4">
            <h3 className="text-xl font-semibold text-blue-700">{servicio.nombre}</h3>
            <p className="text-gray-600">{servicio.descripcion}</p>
            <p className="font-bold mt-2">{servicio.precio}</p>
          </div>
        ))}
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Contacto</h2>
        <p className="text-gray-600">{info.contacto}</p>
        <a
          href="https://wa.me/56989967350?text=Hola,%20quiero%20agendar%20una%20hora"
          target="_blank"
          className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded"
        >
          WhatsApp
        </a>
      </section>
    </div>
  );
}
