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
        deepLink: "/?beneficiary=Pequeño productor#convocatorias"
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
        deepLink: "/?category=Riego y Drenaje#convocatorias"
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
        deepLink: "/?beneficiary=Personas naturales#convocatorias"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {programs.map((program) => (
                        <Link
                            key={program.id}
                            href={program.deepLink}
                            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer"
                        >
                            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-50 text-2xl group-hover:bg-blue-100 transition-colors">
                                {program.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--iica-navy)] dark:text-white mb-2 group-hover:text-[var(--iica-blue)] transition-colors">
                                {program.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {program.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProgramsSection;
