import { NextResponse } from 'next/server';

interface ApiSuccessResponse<T = unknown> {
  ok: true;
  data: T;
}

interface ApiErrorResponse {
  ok: false;
  error: string;
}

export function createSuccessResponse<T>(data: T, status = 200, headers?: Record<string, string>): NextResponse {
  return NextResponse.json({ ok: true, data } as ApiSuccessResponse<T>, { status, headers });
}

export function createErrorResponse(error: string, status = 400, headers?: Record<string, string>): NextResponse {
  return NextResponse.json({ ok: false, error } as ApiErrorResponse, { status, headers });
}
