'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('AportarPage');

export default function AportarPage() {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch('/api/projects/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocurrió un error al enviar la sugerencia.');
      }

      setSuccess(true);
      setUrl('');
      logger.info('User submitted project successfully');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-iica-navy dark:text-white mb-2">Aportar una oportunidad</h1>
        <p className="text-gray-600 dark:text-gray-400">
          ¿Encontraste un fondo concursable, subsidio o programa agrícola que no está en nuestra plataforma?
          Comparte el enlace y nuestra IA extraerá la información automáticamente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-iica-border shadow-sm">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Enlace oficial de la oportunidad
          </label>
          <Input
            id="url"
            type="url"
            placeholder="https://www.agci.cl/becas/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" role="alert">
            ¡Sugerencia enviada! El equipo revisará la información antes de publicarla. Gracias por colaborar.
          </div>
        )}

        <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
          {isSubmitting ? 'Extrayendo datos con IA...' : 'Enviar Sugerencia'}
        </Button>
      </form>
    </div>
  );
}
