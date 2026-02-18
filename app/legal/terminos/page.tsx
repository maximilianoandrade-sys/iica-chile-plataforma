
export default function TermsOfUsePage() {
    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl text-gray-700 leading-relaxed space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--iica-navy)] mb-4">Términos y Condiciones de Uso</h1>
                <p className="text-sm text-gray-500">Última actualización: Febrero 2026</p>
            </div>

            <section className="space-y-4">
                <p>
                    Bienvenido a la Plataforma de Financiamiento Agrícola de IICA Chile. Al acceder y utilizar este sitio web, usted acepta cumplir con los siguientes Términos y Condiciones de Uso. Si no está de acuerdo con alguna parte de estos términos, le recomendamos que no utilice nuestros servicios.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">1. Objeto de la Plataforma</h2>
                <p>
                    Esta plataforma tiene un carácter <strong>informativo y facilitador</strong>. Su objetivo principal es centralizar y simplificar el acceso a la información sobre fondos concursables, subsidios y créditos disponibles para el sector agrícola chileno, provenientes de diversas fuentes públicas (INDAP, CORFO, CNR, FIA, Sercotec, GOREs) e internacionales.
                </p>
                <p className="font-semibold text-red-600">
                    IMPORTANTE: IICA Chile NO es la entidad que otorga estos financiamientos, salvo que se indique explícitamente lo contrario en una convocatoria propia.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">2. Responsabilidad de la Información</h2>
                <p>
                    Si bien realizamos nuestros mejores esfuerzos para garantizar que la información presentada (fechas, montos, requisitos) sea precisa y esté actualizada, <strong>IICA Chile no se hace responsable por errores, omisiones o cambios de última hora</strong> realizados por las instituciones convocantes oficiales.
                </p>
                <p>
                    Es responsabilidad exclusiva del usuario <strong>verificar siempre la información en las bases oficiales y sitios web de las instituciones correspondientes</strong> antes de realizar cualquier postulación o toma de decisiones financieras. Proporcionamos enlaces directos a estas fuentes oficiales para facilitar dicha verificación.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">3. Uso Aceptable</h2>
                <p>
                    Usted se compromete a utilizar la plataforma únicamente con fines legales y de acuerdo con estos términos. Queda prohibido:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Utilizar la plataforma de manera que pueda dañar, deshabilitar o sobrecargar nuestros servidores o redes.</li>
                    <li>Intentar obtener acceso no autorizado a sistemas informáticos o redes conectadas a la plataforma.</li>
                    <li>Utilizar bots, scrapers u otros medios automatizados para acceder a la plataforma sin nuestro permiso previo por escrito.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">4. Enlaces a Terceros</h2>
                <p>
                    Nuestra plataforma puede contener enlaces a sitios web de terceros que no son propiedad ni están controlados por IICA Chile. No tenemos control sobre el contenido, las políticas de privacidad o las prácticas de dichos sitios web y no asumimos ninguna responsabilidad por ellos.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">5. Propiedad Intelectual</h2>
                <p>
                    Todo el contenido original de la plataforma, incluyendo textos, gráficos, logotipos e íconos, es propiedad exclusiva de IICA Chile o sus licenciatarios y está protegido por las leyes de propiedad intelectual chilenas e internacionales. El uso no autorizado de dicho contenido está estrictamente prohibido.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">6. Modificaciones de los Términos</h2>
                <p>
                    Nos reservamos el derecho de modificar o reemplazar estos Términos en cualquier momento a nuestra entera discreción. Es su responsabilidad revisar periódicamente estos Términos para estar informado de cualquier cambio.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">7. Contacto</h2>
                <p>
                    Si tiene alguna duda sobre estos Términos y Condiciones, por favor contáctenos a través de iica.chile@iica.int.
                </p>
            </section>
        </main>
    );
}
