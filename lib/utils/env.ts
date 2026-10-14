import { z } from 'zod';
import { getLogger } from './logger';

const logger = getLogger('Env');

// Una var opcional marcada como URL no debe tumbar la app si está vacía o mal
// formada: se tolera y queda undefined (la funcionalidad que la usa se degrada).
const optionalUrl = z
  .string()
  .url()
  .optional()
  .or(z.literal(''))
  .transform((value) => (value ? value : undefined));

/**
 * Variables de entorno validadas.
 * Las vars requeridas lanzan error al inicio si faltan.
 * Las opcionales retornan undefined (y toleran valores vacíos/inválidos).
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
  ADMIN_PASSWORD: z.string().min(1).optional(),
  // Requeridas en producción
  CRON_SECRET: z.string().min(1).optional(),
  // Opcionales
  GEMINI_API_KEY: z.string().optional(),
  MERCADO_PUBLICO_TICKET: z.string().optional(),
  ADMIN_EMAIL: z.string().optional(),
  NOTIFICATION_WEBHOOK: optionalUrl,
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  KV_REST_API_URL: optionalUrl,
  KV_REST_API_TOKEN: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().refine((value) => {
    if (value.startsWith('mailto:')) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.slice('mailto:'.length));
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'VAPID_SUBJECT debe ser un email mailto: o una URL HTTPS').optional(),
  SEARCH_EXTERNAL_ENABLED: z.enum(['true', 'false']).optional(),
  SEARCH_SOURCE_MODE_DEFAULT: z.enum(['internal', 'external', 'mixed']).optional(),
  SEARCH_EXTERNAL_DISABLED_PROVIDERS: z.string().optional(),
  SEARCH_QUALITY_STRICT_ENABLED: z.enum(['true', 'false']).optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VERCEL_URL: z.string().optional(),
  TRUSTED_PROXY_IP_HEADER: z.enum(['x-real-ip', 'x-forwarded-for', 'x-vercel-forwarded-for']).optional(),
  IICA_HEADLESS: z.string().optional(),
  IICA_DELAY_MS: z.string().optional(),
  IICA_USER_DATA_DIR: z.string().optional(),
});



export type Env = z.infer<typeof EnvSchema>;
export type AuthEnv = Pick<Env, 'ADMIN_SESSION_SECRET' | 'ADMIN_PASSWORD' | 'NODE_ENV'>;
export type AiEnv = Pick<Env, 'GEMINI_API_KEY'>;

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

export function getAuthEnv(): AuthEnv {
  const env = getEnv();
  if (env.NODE_ENV === 'production' && env.ADMIN_SESSION_SECRET.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET debe tener al menos 32 caracteres en producción');
  }
  return {
    ADMIN_SESSION_SECRET: env.ADMIN_SESSION_SECRET,
    ADMIN_PASSWORD: env.ADMIN_PASSWORD,
    NODE_ENV: env.NODE_ENV,
  };
}

export function getAiEnv(): AiEnv {
  const env = getEnv();
  return {
    GEMINI_API_KEY: env.GEMINI_API_KEY,
  };
}

/** Non-blocking env getter for public/static contexts */
export function getPublicEnv(): Partial<Env> {
  try {
    return getEnv();
  } catch {
    return {
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
      NODE_ENV: (process.env.NODE_ENV as Env['NODE_ENV']) || 'development',
    };
  }
}

/** Reset cache — only for testing */
export function _resetEnvCache(): void {
  cachedEnv = null;
}

