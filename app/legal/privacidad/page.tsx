
export default function PrivacyPolicyPage() {
    return (
        <main className="container mx-auto px-4 py-12 max-w-4xl text-gray-700 leading-relaxed space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--iica-navy)] mb-4">Política de Privacidad</h1>
                <p className="text-sm text-gray-500">Última actualización: Febrero 2026</p>
            </div>

            <section className="space-y-4">
                <p>
                    En IICA Chile, nos tomamos muy en serio la privacidad de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos y protegemos su información personal cuando utiliza nuestra Plataforma de Financiamiento Agrícola.
                </p>
                <p>
                    Al utilizar nuestro sitio web, usted acepta las prácticas descritas en esta política. Nos comprometemos a cumplir con la Ley N° 19.628 sobre Protección de la Vida Privada vigente en Chile.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">1. Información que Recopilamos</h2>
                <p>
                    Recopilamos información personal únicamente cuando usted nos la proporciona voluntariamente. Esto puede incluir:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Su dirección de correo electrónico al suscribirse a nuestro boletín informativo.</li>
                    <li>Su número de teléfono celular al optar por recibir notificaciones vía WhatsApp.</li>
                    <li>Información sobre su tipo de producción o región al interactuar con nuestro Asistente Inteligente (esta información se utiliza de forma anónima para mejorar el servicio).</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">2. Finalidad del Uso de Datos</h2>
                <p>
                    Utilizamos su información personal exclusivamente para los siguientes fines:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Enviarle información sobre nuevos fondos concursables, becas y oportunidades de financiamiento relevantes para su perfil agrícola.</li>
                    <li>Mejorar la funcionalidad y el contenido de nuestra plataforma basándonos en las necesidades de los usuarios.</li>
                    <li>Responder a sus consultas o solicitudes de soporte técnico.</li>
                </ul>
                <p className="font-semibold">
                    No utilizamos sus datos para fines publicitarios comerciales de terceros ni vendemos su información.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">3. Notificaciones vía WhatsApp</h2>
                <p>
                    Al suscribirse a nuestro servicio de alertas por WhatsApp, usted consiente explícitamente recibir mensajes automatizados o manuales relacionados exclusivamente con oportunidades de financiamiento agrícola. Puede darse de baja de este servicio en cualquier momento enviando la palabra "BAJA" al mismo número o contactándonos directamente.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">4. Cookies y Tecnologías Similares</h2>
                <p>
                    Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación, analizar el tráfico del sitio y personalizar el contenido. Puede configurar su navegador para rechazar todas o algunas cookies, pero esto puede afectar la funcionalidad de la plataforma.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">5. Seguridad de la Información</h2>
                <p>
                    Implementamos medidas de seguridad técnicas y organizativas razonables para proteger su información personal contra el acceso no autorizado, la pérdida o la alteración. Sin embargo, ninguna transmisión de datos por Internet es completamente segura, por lo que no podemos garantizar la seguridad absoluta.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">6. Sus Derechos</h2>
                <p>
                    De acuerdo con la legislación chilena, usted tiene derecho a acceder, rectificar o cancelar sus datos personales en cualquier momento. Para ejercer estos derechos, por favor contáctenos a través de los canales oficiales de IICA Chile.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--iica-blue)]">7. Contacto</h2>
                <p>
                    Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos en:
                </p>
                <p className="font-medium">
                    IICA Chile<br />
                    Correo electrónico: iica.chile@iica.int<br />
                    Dirección: Santiago, Chile.
                </p>
            </section>
        </main>
    );
}
