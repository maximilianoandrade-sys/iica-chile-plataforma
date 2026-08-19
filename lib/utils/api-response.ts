import { NextResponse } from 'next/server';

export function createSuccessResponse<T>(data: T, status = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json({ ok: true, data }, { status, headers });
}

export function createErrorResponse(
  error: string,
  status = 400,
  headers?: Record<string, string>,
  data?: unknown,
): NextResponse {
  return NextResponse.json({ ok: false, error, data }, { status, headers });
}

