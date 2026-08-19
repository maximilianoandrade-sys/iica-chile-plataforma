'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function DataRightsPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Solicitud ARCO+ — ${requestType || 'General'}`);
    const body = encodeURIComponent(
      `Nombre completo: ${fullName}\nCorreo electrónico: ${email}\nTipo de solicitud: ${requestType}\n\nDetalle:\n${details}`
    );
    window.location.href = `mailto:representacion.chile@iica.int?subject=${subject}&body=${body}`;
  };

  return (
    <main className="container mx-auto max-w-4xl px-4 py-12 text-gray-700 leading-relaxed space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--iica-navy)] dark:text-white mb-4">Derechos ARCO+</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Última actualización: Junio 2026</p>
      </div>

      <section className="space-y-4">
        <p className="dark:text-gray-300">
          De acuerdo con la normativa vigente en Chile (Ley 21.719), usted puede ejercer sus derechos sobre los datos personales
          que tratamos en la plataforma.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--iica-blue)] dark:text-blue-400">Derechos disponibles</h2>
        <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
          <li>Acceso a sus datos personales.</li>
          <li>Rectificación de datos inexactos o incompletos.</li>
          <li>Cancelación o supresión cuando corresponda legalmente.</li>
          <li>Oposición al tratamiento en casos previstos por la ley.</li>
          <li>Portabilidad, cuando sea aplicable.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-[var(--iica-blue)] dark:text-blue-400">Formulario de solicitud</h2>
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-6 shadow-sm">
          <div className="space-y-1">
            <label htmlFor="full-name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre completo</label>
            <input
              id="full-name"
              name="full-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="request-type" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tipo de solicitud</label>
            <select
              id="request-type"
              name="request-type"
              required
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
            >
              <option value="">Seleccione una opción</option>
              <option value="Acceso">Acceso</option>
              <option value="Rectificación">Rectificación</option>
              <option value="Cancelación">Cancelación</option>
              <option value="Oposición">Oposición</option>
              <option value="Portabilidad">Portabilidad</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="details" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Detalle de la solicitud</label>
            <textarea
              id="details"
              name="details"
              rows={5}
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Enviar Solicitud ARCO+ vía Correo
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Al hacer clic en enviar, se abrirá su cliente de correo con los datos redactados para enviar a{' '}
            <a className="text-[var(--iica-blue)] underline dark:text-blue-400" href="mailto:representacion.chile@iica.int">
              representacion.chile@iica.int
            </a>. El plazo objetivo de respuesta es de 5 días hábiles.
          </p>
        </form>
      </section>
    </main>
  );
}
