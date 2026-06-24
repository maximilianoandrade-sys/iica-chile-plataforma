import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Política de Privacidad | IICA Chile',
    description: 'Política de privacidad y protección de datos personales conforme a la Ley 21.719.',
    alternates: { canonical: '/legal/privacidad' },
    openGraph: {
        title: 'Política de Privacidad | IICA Chile',
        description: 'Política de privacidad y protección de datos personales conforme a la Ley 21.719.',
        url: '/legal/privacidad',
    },
    twitter: {
        card: 'summary',
        title: 'Política de Privacidad | IICA Chile',
        description: 'Política de privacidad y protección de datos personales.',
    },
};

export default function PrivacyPolicyPage() {
    return (
        <main className="container mx-auto px-4 py-12 max-w-3xl text-gray-700 leading-relaxed space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--iica-navy)] mb-4">
                    Política de Privacidad
                </h1>
                <p className="text-sm text-gray-500">Última actualización: Junio 2026</p>
            </div>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">
                    1. Responsable del tratamiento
                </h2>
                <p>
                    El responsable del tratamiento de sus datos personales es el{' '}
                    <strong>Instituto Interamericano de Cooperación para la Agricultura (IICA), Oficina en Chile</strong>,
                    con domicilio en Calle Rancagua N.° 0320, Providencia, Santiago, Chile.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">
                    2. Datos que recopilamos
                </h2>
                <p>
                    Recopilamos información personal únicamente cuando usted nos la proporciona
                    de forma voluntaria o cuando interactúa con la plataforma:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>Correo electrónico:</strong> al suscribirse a nuestro boletín informativo (newsletter).
                    </li>
                    <li>
                        <strong>Cookies:</strong> cookies técnicas necesarias para el funcionamiento del sitio y,
                        con su consentimiento, cookies analíticas para estadísticas anónimas de uso.
                    </li>
                    <li>
                        <strong>localStorage:</strong> almacenamiento local en su navegador para guardar
                        preferencias de interfaz y el estado de su consentimiento de cookies.
                    </li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">
                    3. Finalidad del tratamiento
                </h2>
                <p>
                    Utilizamos sus datos personales exclusivamente para las siguientes finalidades:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        Envío de boletines informativos (newsletters) sobre fondos concursables,
                        subsidios y oportunidades de financiamiento para el sector agrícola.
                    </li>
                    <li>
                        Mejora de la experiencia de usuario (UX) de la plataforma, adaptando la
                        navegación a sus preferencias.
                    </li>
                    <li>
                        Generación de estadísticas anónimas y agregadas de uso del sitio para
                        mejorar nuestros contenidos y servicios.
                    </li>
                </ul>
                <p className="font-semibold">
                    No vendemos, compartimos ni cedemos sus datos personales a terceros con fines
                    comerciales.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">
                    4. Base legal
                </h2>
                <p>
                    El tratamiento de sus datos personales se fundamenta en su{' '}
                    <strong>consentimiento libre, específico, informado e inequívoco</strong>, otorgado
                    al suscribirse al boletín o al aceptar las cookies en el banner de consentimiento.
                </p>
                <p>
                    Este tratamiento se realiza conforme a la{' '}
                    <strong>Ley 21.719 sobre Protección de Datos Personales</strong> de Chile y demás
                    normativa aplicable en materia de privacidad y protección de datos.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">
                    5. Almacenamiento local (localStorage)
                </h2>
                <p>
                    Utilizamos el almacenamiento local de su navegador (localStorage) para guardar:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>Preferencias de interfaz:</strong> como el estado de paneles colapsados,
                        filtros seleccionados u otras configuraciones de visualización.
                    </li>
                    <li>
                        <strong>Estado de consentimiento:</strong> para recordar su decisión respecto a las
                        cookies y no volver a solicitar su autorización innecesariamente.
                    </li>
                </ul>
                <p>
                    Estos datos se almacenan exclusivamente en su dispositivo y no se transmiten a
                    nuestros servidores. Puede eliminarlos en cualquier momento desde la configuración
                    de su navegador.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">
                    6. Sus derechos
                </h2>
                <p>
                    De acuerdo con la Ley 21.719, usted tiene derecho a:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>
                        <strong>Acceso:</strong> solicitar información sobre los datos personales que
                        mantenemos sobre usted.
                    </li>
                    <li>
                        <strong>Rectificación:</strong> solicitar la corrección de datos inexactos o
                        incompletos.
                    </li>
                    <li>
                        <strong>Supresión:</strong> solicitar la eliminación de sus datos personales
                        cuando ya no sean necesarios para la finalidad para la cual fueron recopilados.
                    </li>
                    <li>
                        <strong>Revocación del consentimiento:</strong> retirar su consentimiento en
                        cualquier momento, sin que ello afecte la licitud del tratamiento previo.
                    </li>
                </ul>
                <p>
                    Para ejercer cualquiera de estos derechos, puede contactarnos a través del
                    correo electrónico indicado en la sección de contacto.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">
                    7. Contacto
                </h2>
                <p>
                    Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus
                    derechos, puede contactarnos en:
                </p>
                <p className="font-medium">
                    IICA Chile<br />
                    Correo electrónico:{' '}
                    <a
                        href="mailto:chile.iica@iica.int"
                        className="underline text-[var(--iica-blue)]"
                    >
                        chile.iica@iica.int
                    </a>
                    <br />
                    Dirección: Calle Rancagua N.° 0320, Providencia, Santiago, Chile.
                </p>
            </section>



            {/* Back link */}
            <div className="pt-4">
                <Link
                    href="/"
                    className="text-sm text-[var(--iica-blue)] hover:underline"
                >
                    &larr; Volver al inicio
                </Link>
            </div>
        </main>
    );
}
