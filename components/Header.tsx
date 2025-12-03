'use client';

export default function Header() {
  return (
    <header className="w-full bg-gradient-to-r from-[#0066cc] to-[#00a651] text-white shadow-xl">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="https://digital.fontagro.org/wp-content/uploads/2020/07/iica-logo-2-2.png" 
                alt="Logo oficial IICA - Instituto Interamericano de Cooperación para la Agricultura" 
                className="h-14 md:h-16 w-auto"
                loading="eager"
              />
            </div>
            <div className="hidden sm:block border-l border-white/30 pl-4">
              <h1 className="text-xl md:text-2xl font-bold leading-tight">
                Plataforma de Licitaciones IICA
              </h1>
              <p className="text-sm md:text-base text-white/90 mt-1">
                Oportunidades de financiamiento 2025
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
              Instituto Interamericano de Cooperación para la Agricultura
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

