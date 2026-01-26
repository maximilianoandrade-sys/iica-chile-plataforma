import React from 'react';

export const metadata = {
    title: 'Términos de Uso | IICA Chile',
    description: 'Términos y Condiciones de Uso de la Plataforma de Financiamiento Agrícola del IICA Chile',
};

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto max-w-4xl px-4 py-12">
                {/* Header */}
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <h1 className="text-4xl font-bold text-[var(--iica-navy)] mb-2">
                        Términos de Uso
                    </h1>
                    <p className="text-sm text-gray-600">
                        Al utilizar la Plataforma de Financiamiento Agrícola IICA Chile, usted acepta los siguientes términos y condiciones.
                    </p>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            1. Naturaleza de la Información
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Esta plataforma es una herramienta informativa diseñada para facilitar el acceso a oportunidades de financiamiento agrícola en Chile.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <span className="text-[var(--iica-blue)] font-bold mr-2">•</span>
                                <div>
                                    <strong className="text-gray-900">Carácter Referencial:</strong>
                                    <span className="text-gray-700"> La información sobre fechas, montos y requisitos de los fondos concursables es referencial.</span>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[var(--iica-blue)] font-bold mr-2">•</span>
                                <div>
                                    <strong className="text-gray-900">Fuente Oficial:</strong>
                                    <span className="text-gray-700"> El usuario <strong>siempre</strong> debe verificar las bases oficiales en el sitio web de la institución otorgante (INDAP, CORFO, FIA, etc.) antes de postular.</span>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <span className="text-[var(--iica-blue)] font-bold mr-2">•</span>
                                <div>
                                    <strong className="text-gray-900">Sin Responsabilidad:</strong>
                                    <span className="text-gray-700"> El IICA no se hace responsable por cambios de última hora en las bases, errores en la postulación o la no adjudicación de los fondos.</span>
                                </div>
                            </li>
                        </ul>
                        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                            <p className="text-gray-800 text-sm">
                                <strong>⚠️ Importante:</strong> Esta plataforma es una herramienta de apoyo informativo. La responsabilidad de verificar la información oficial y cumplir con los requisitos de postulación recae exclusivamente en el usuario.
                            </p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            2. Propiedad Intelectual
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Todo el material contenido en este sitio (logos, textos, compilaciones de datos y código fuente) es propiedad del <strong>Instituto Interamericano de Cooperación para la Agricultura (IICA)</strong> o de sus fuentes citadas, y está protegido por las leyes de derecho de autor y tratados internacionales.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Se permite el uso del contenido para fines informativos, educativos o de investigación.</li>
                            <li>Queda prohibida la reproducción total o parcial con fines comerciales sin autorización expresa.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            3. Enlaces a Terceros
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            La plataforma contiene enlaces a sitios web externos (ej. indap.gob.cl, corfo.cl). El IICA no tiene control sobre dichos sitios y no es responsable de su contenido, disponibilidad o políticas de privacidad.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-[var(--iica-navy)] mb-4">
                            4. Modificaciones
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            El IICA se reserva el derecho de modificar, suspender o discontinuar cualquier aspecto de la plataforma en cualquier momento sin previo aviso.
                        </p>
                    </section>

                    {/* Contact Section */}
                    <section className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-[var(--iica-navy)] mb-4">
                            Contacto Legal
                        </h3>
                        <p className="text-gray-700 mb-2">
                            Si tiene dudas sobre estos términos, contáctenos en:
                        </p>
                        <ul className="space-y-2 text-gray-700">
                            <li>
                                <strong>Email:</strong>{' '}
                                <a
                                    href="mailto:representacion.chile@iica.int"
                                    className="text-[var(--iica-blue)] hover:underline"
                                >
                                    representacion.chile@iica.int
                                </a>
                            </li>
                            <li>
                                <strong>Dirección:</strong> Calle Rancagua No.0320, Providencia, Santiago, Chile.
                            </li>
                            <li>
                                <strong>Teléfono:</strong> (+56) 2 2225 2511
                            </li>
                        </ul>
                    </section>

                    {/* Footer */}
                    <div className="mt-12 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 text-center">
                            Estos términos se basan en las normativas de Copyright y estatus de organismo internacional del IICA.
                            Para más información, visite{' '}
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
