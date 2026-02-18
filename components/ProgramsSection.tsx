import React from 'react';
import Link from 'next/link';

// Datos de los Programas (Basado en el Plan de Mediano Plazo IICA)
interface Program {
    id: number;
    title: string;
    description: string;
    icon: string;
    deepLink: string; // URL with category filter
}

const programs: Program[] = [
    {
        id: 1,
        title: "Innovación y Bioeconomía",
        description: "Nuevos usos de la biomasa, biotecnología y economía circular.",
        icon: "🌱",
        deepLink: "/?category=Innovación#convocatorias"
    },
    {
        id: 2,
        title: "Desarrollo Territorial y Agricultura Familiar",
        description: "Fortalecimiento de pequeños productores y asociatividad rural.",
        icon: "🚜",
        deepLink: "/?beneficiary=Pequeño Agricultor#convocatorias"
    },
    {
        id: 3,
        title: "Comercio Internacional e Integración",
        description: "Acceso a mercados, sanidad para exportación y cadenas de valor.",
        icon: "🌍",
        deepLink: "/?category=Internacional#convocatorias"
    },
    {
        id: 4,
        title: "Acción Climática y Sostenibilidad",
        description: "Adaptación al cambio climático y gestión hídrica eficiente.",
        icon: "💧",
        deepLink: "/?category=Riego#convocatorias"
    },
    {
        id: 5,
        title: "Sanidad Agropecuaria e Inocuidad",
        description: "Normativas fitosanitarias y seguridad alimentaria.",
        icon: "🛡️",
        deepLink: "/?category=Sanidad#convocatorias"
    },
    {
        id: 6,
        title: "Digitalización Agroalimentaria",
        description: "Agricultura digital 4.0 y conectividad rural.",
        icon: "📱",
        deepLink: "/?category=Innovación#convocatorias"
    },
    {
        id: 7,
        title: "Equidad de Género y Juventudes",
        description: "Inclusión y liderazgo de mujeres y jóvenes en el agro.",
        icon: "👥",
        deepLink: "/?beneficiary=Mujer#convocatorias"
    }
];

const ProgramsSection = () => {
    return (
        <section className="py-12 bg-transparent">
            {/* bg-transparent asegura que tome el fondo de tu web */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Título de la Sección */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-[var(--iica-navy)] dark:text-white">
                        Programas Hemisféricos
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Ejes estratégicos de cooperación técnica del IICA
                    </p>
                </div>

                {/* Grid de Tarjetas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {programs.map((program) => (
                        <Link
                            key={program.id}
                            href={program.deepLink}
                            className="group flex flex-col items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer h-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">{program.icon}</span>
                            </div>

                            <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-3xl group-hover:bg-[var(--iica-blue)] group-hover:text-white transition-all duration-300 shadow-sm">
                                {program.icon}
                            </div>

                            <h3 className="text-lg md:text-xl font-bold text-[var(--iica-navy)] dark:text-white mb-3 group-hover:text-[var(--iica-blue)] transition-colors leading-tight">
                                {program.title}
                            </h3>

                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">
                                {program.description}
                            </p>

                            <div className="mt-auto pt-4 flex items-center text-sm font-bold text-[var(--iica-blue)] opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                Ver convocatorias →
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProgramsSection;
