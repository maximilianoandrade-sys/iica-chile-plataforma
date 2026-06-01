import { z } from 'zod';
import { getLogger } from './logger';

const logger = getLogger('Env');

/**
 * Variables de entorno validadas.
 * Las vars requeridas lanzan error al inicio si faltan.
 * Las opcionales retornan undefined.
 *
 * Uso: import { getEnv } from '@/lib/utils/env';
 *      const env = getEnv();
 *      env.DATABASE_URL // string (garantizado)
 *      env.GEMINI_API_KEY // string | undefined
 */
const EnvSchema = z.object({
  // Requeridas
  DATABASE_URL: z.string().min(1),
  ADMIN_SESSION_SECRET: z.string().min(8),
  // Requeridas en producción
  CRON_SECRET: z.string().min(1).optional(),
  // Opcionales
  GEMINI_API_KEY: z.string().optional(),
  MERCADO_PUBLICO_TICKET: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  NOTIFICATION_WEBHOOK: z.string().optional(),
  SEARCH_EXTERNAL_ENABLED: z.enum(['true', 'false']).optional(),
  SEARCH_SOURCE_MODE_DEFAULT: z.enum(['internal', 'external', 'mixed']).optional(),
  SEARCH_EXTERNAL_DISABLED_PROVIDERS: z.string().optional(),
  SEARCH_QUALITY_STRICT_ENABLED: z.enum(['true', 'false']).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof EnvSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    logger.error('Validación de entorno falló', new Error(missing.join('; ')));
    throw new Error(`Variables de entorno faltantes/inválidas:\n  ${missing.join('\n  ')}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}

/** Reset cache — only for testing */
export function _resetEnvCache(): void {
  cachedEnv = null;
}
