import React from 'react';

export const metadata = {
    title: 'Política de Privacidad | IICA Chile',
    description: 'Política de Privacidad de la Plataforma de Financiamiento Agrícola del IICA Chile',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto max-w-4xl px-4 py-12">
                {/* Header */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <h1 className="text-4xl font-bold text-[var(--iica-navy)] mb-2">
                        Política de Privacidad
                    </h1>
                    <p className="text-sm text-gray-600">
                        <strong>Última actualización:</strong> Enero 2026
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-6">
                        El Instituto Interamericano de Cooperación para la Agricultura (IICA) respeta su privacidad y se compromete a proteger sus datos personales. Esta política describe cómo recopilamos, usamos y protegemos su información en la Plataforma de Financiamiento Agrícola.
                    </p>

                    {/* Section 1 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            1. Responsable del Tratamiento
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            El responsable del tratamiento de sus datos es el <strong>IICA (Oficina Chile)</strong>.
                            De conformidad con nuestra Política Institucional sobre Protección de Datos Personales, garantizamos que los mecanismos de uso son seguros y confidenciales.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            2. Uso de la Información
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Sus datos personales (como su correo electrónico suscrito a nuestras alertas) serán utilizados únicamente para los siguientes propósitos:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Enviar material informativo sobre fondos concursables y convocatorias (Alertas Semanales).</li>
                            <li>Contactar y contestar solicitudes enviadas a través de la plataforma.</li>
                            <li>Compilar estadísticas generales de uso de la plataforma.</li>
                            <li>Realizar encuestas de satisfacción para mejorar el servicio.</li>
                        </ul>
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-[var(--iica-blue)] rounded">
                            <p className="text-gray-800">
                                <strong>Importante:</strong> El IICA no cede, renta, ni transfiere su información personal a terceros sin su previo consentimiento, salvo obligación legal.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            3. Seguridad
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Implementamos medidas técnicas y organizativas idóneas para asegurar que sus datos sean almacenados de manera que se impida el acceso indeseado. Sin embargo, el usuario comprende que ninguna transmisión por internet es 100% segura.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            4. Sus Derechos
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Usted tiene derecho en cualquier momento a:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Acceder y solicitar una copia de sus datos.</li>
                            <li>Solicitar que su información sea rectificada o eliminada de nuestra base de datos.</li>
                            <li>Darse de baja de las alertas haciendo clic en el enlace "Cancelar suscripción" al pie de nuestros correos.</li>
                        </ul>
                        <div className="mt-4 p-4 bg-green-50 border-l-4 border-[var(--iica-green)] rounded">
                            <p className="text-gray-800">
                                Para ejercer estos derechos, puede contactarnos directamente a:{' '}
                                <a
                                    href="mailto:representacion.chile@iica.int"
                                    className="text-[var(--iica-blue)] hover:underline font-semibold"
                                >
                                    representacion.chile@iica.int
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            Esta política se basa en el Aviso de Privacidad oficial del IICA publicado en{' '}
                            <a
                                href="https://www.iica.int"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--iica-blue)] hover:underline"
                            >
                                iica.int
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
