import { NextRequest } from 'next/server';
import { POST as subscribePOST } from './subscribe/route';

/**
 * Endpoint unificado de newsletter (delega a /api/newsletter/subscribe)
 * compatible con componentes legados y Ley 21.719.
 */
export async function POST(req: NextRequest) {
  return subscribePOST(req);
}
