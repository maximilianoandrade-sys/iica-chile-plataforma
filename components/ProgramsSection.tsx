import React from 'react';

// Datos de los Programas (Basado en el Plan de Mediano Plazo IICA)
interface Program {
    id: number;
    title: string;
    description: string;
    icon: string;
}

const programs: Program[] = [
    {
        id: 1,
        title: "Innovación y Bioeconomía",
        description: "Nuevos usos de la biomasa, biotecnología y economía circular.",
        icon: "🌱" // Puedes cambiar esto por un <Icon /> real si usas una librería
    },
    {
        id: 2,
        title: "Desarrollo Territorial y Agricultura Familiar",
        description: "Fortalecimiento de pequeños productores y asociatividad rural.",
        icon: "🚜"
    },
    {
        id: 3,
        title: "Comercio Internacional e Integración",
        description: "Acceso a mercados, sanidad para exportación y cadenas de valor.",
        icon: "🌍"
    },
    {
        id: 4,
        title: "Acción Climática y Sostenibilidad",
        description: "Adaptación al cambio climático y gestión hídrica eficiente.",
        icon: "💧"
    },
    {
        id: 5,
        title: "Sanidad Agropecuaria e Inocuidad",
        description: "Normativas fitosanitarias y seguridad alimentaria.",
        icon: "🛡️"
    },
    {
        id: 6,
        title: "Digitalización Agroalimentaria",
        description: "Agricultura digital 4.0 y conectividad rural.",
        icon: "📱"
    },
    {
        id: 7,
        title: "Equidad de Género y Juventudes",
        description: "Inclusión y liderazgo de mujeres y jóvenes en el agro.",
        icon: "users" // Representación textual si no hay icono
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
                        <div
                            key={program.id}
                            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-blue-50 text-2xl group-hover:bg-blue-100 transition-colors">
                                {program.icon === "users" ? "👥" : program.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-[var(--iica-navy)] dark:text-white mb-2">
                                {program.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                {program.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProgramsSection;
