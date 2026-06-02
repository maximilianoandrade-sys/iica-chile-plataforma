import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Derechos ARCO+ | IICA Chile',
  description: 'Solicite el ejercicio de sus derechos de protección de datos (acceso, rectificación, cancelación, oposición y portabilidad).',
  alternates: {
    canonical: '/legal/derechos',
  },
};

export default function DataRightsPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 text-gray-700 leading-relaxed space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--iica-navy)] mb-4">Derechos ARCO+</h1>
        <p className="text-sm text-gray-500">Última actualización: Junio 2026</p>
      </div>

      <section className="space-y-4">
        <p>
          De acuerdo con la normativa vigente en Chile (Ley 21.719), usted puede ejercer sus derechos sobre los datos personales
          que tratamos en la plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--iica-blue)]">Derechos disponibles</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Acceso a sus datos personales.</li>
          <li>Rectificación de datos inexactos o incompletos.</li>
          <li>Cancelación o supresión cuando corresponda legalmente.</li>
          <li>Oposición al tratamiento en casos previstos por la ley.</li>
          <li>Portabilidad, cuando sea aplicable.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--iica-blue)]">Formulario de solicitud</h2>
        <form className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <label htmlFor="full-name" className="text-sm font-semibold text-gray-700">Nombre completo</label>
            <input id="full-name" name="full-name" type="text" required className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo electrónico</label>
            <input id="email" name="email" type="email" required className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          <div className="space-y-1">
            <label htmlFor="request-type" className="text-sm font-semibold text-gray-700">Tipo de solicitud</label>
            <select id="request-type" name="request-type" required className="w-full rounded-lg border border-gray-300 px-3 py-2">
              <option value="">Seleccione una opción</option>
              <option value="acceso">Acceso</option>
              <option value="rectificacion">Rectificación</option>
              <option value="cancelacion">Cancelación</option>
              <option value="oposicion">Oposición</option>
              <option value="portabilidad">Portabilidad</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="details" className="text-sm font-semibold text-gray-700">Detalle de la solicitud</label>
            <textarea id="details" name="details" rows={5} required className="w-full rounded-lg border border-gray-300 px-3 py-2" />
          </div>

          <p className="text-xs text-gray-500">
            Para enviar esta solicitud, escriba a{' '}
            <a className="text-[var(--iica-blue)] underline" href="mailto:representacion.chile@iica.int">
              representacion.chile@iica.int
            </a>{' '}
            con asunto &quot;Solicitud ARCO+&quot;. El plazo objetivo de respuesta es de 5 días hábiles.
          </p>
        </form>
      </section>
    </main>
  );
}
