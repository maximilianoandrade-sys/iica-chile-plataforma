import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { getEnv } from '@/lib/utils/env';
import { getLogger } from '@/lib/utils/logger';

const logger = getLogger('AdminAuth');
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Validates an admin session token (sig.timestamp) against ADMIN_SESSION_SECRET.
 */
export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;

  let secret: string;
  try {
    secret = getEnv().ADMIN_SESSION_SECRET;
  } catch {
    logger.error('ADMIN_SESSION_SECRET not configured', new Error('Missing admin session secret'));
    return false;
  }

  if (!secret) return false;

  try {
    const dotIndex = token.lastIndexOf('.');
    if (dotIndex === -1) return false;

    const sig = token.substring(0, dotIndex);
    const timestamp = token.substring(dotIndex + 1);
    const ts = Number(timestamp);
    if (Number.isNaN(ts)) return false;

    // Check expiration
    if (Date.now() - ts > MAX_AGE_MS) {
      logger.warn('Admin token has expired');
      return false;
    }

    const expected = createHmac('sha256', secret)
      .update(`admin-session:${timestamp}`)
      .digest('hex');

    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch (error) {
    logger.error('Admin token verification error', error as Error);
    return false;
  }
}

/**
 * Asserts admin session from cookies in Server Actions or Route Handlers.
 * Throws an Error if unauthorized.
 */
export async function assertAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token')?.value;

  if (!verifyAdminToken(token)) {
    logger.warn('Unauthorized access attempt to admin server action');
    throw new Error('No autorizado: sesión de administrador requerida');
  }
}
