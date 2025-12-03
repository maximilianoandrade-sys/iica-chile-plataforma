'use client';

export default function Header() {
  return (
    <header className="w-full flex items-center px-5 py-4 bg-gradient-to-r from-[#0066cc] to-[#00a651] text-white shadow-lg">
      <img 
        src="https://digital.fontagro.org/wp-content/uploads/2020/07/iica-logo-2-2.png" 
        alt="Logo oficial IICA - Instituto Interamericano de Cooperación para la Agricultura" 
        className="h-12 md:h-14 w-auto mr-5"
        loading="lazy"
      />
      <h1 className="text-xl md:text-2xl font-bold">
        Plataforma de Licitaciones IICA
      </h1>
    </header>
  );
}

