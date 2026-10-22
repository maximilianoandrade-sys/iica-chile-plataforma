/**
 * ============================================================================
 * UNIFIED TYPES & SCHEMAS — IICA CHILE PLATAFORMA
 * Single source of truth for Data Models, API Responses & Supabase Entities.
 * ============================================================================
 */

import type { Project, FilterCounts } from '@/lib/project-utils';

export interface ProjectFilterSnapshot {
  id: number;
  institucion: string;
  monto: number;
  fecha_cierre: string;
  estadoPostulacion: 'Abierta' | 'Próxima' | 'Cerrada' | undefined;
  regiones: string[];
  region: string | null;
  ambito: string | null;
  categoria: string;
  url_bases: string;
}

// Re-export core domain types
export type { Project, FilterCounts };
export * from '@/lib/project-utils';

// ============================================================================
// 1. UNIFIED API RESPONSE SCHEMAS
// ============================================================================

export interface ApiResponseSuccess<T> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiResponseError {
  ok: false;
  error: string;
  code?: string | number;
  details?: unknown;
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// 2. SUPABASE / DATABASE ENTITIES
// ============================================================================

export interface DatabaseSource {
  id: number;
  slug: string;
  name: string;
  type: string;
  enabled: boolean;
  lastRunAt: Date | null;
  lastRunStatus: string | null;
  lastRunError: string | null;
  projectsCount: number;
  homepageUrl: string | null;
}

export interface DatabaseUsuario {
  id: number;
  email: string;
  nombre: string | null;
  region: string | null;
  intereses: string[];
  fechaRegistro: Date;
}

export interface DatabaseFavorito {
  id: number;
  usuarioId: number;
  proyectoId: number | null;
  notas: string | null;
  createdAt: Date;
}

export interface DatabaseLinkCheck {
  id: number;
  url: string;
  status: string;
  statusCode: number | null;
  lastModified: string | null;
  lastChecked: Date;
  isValid: boolean;
}

export interface DatabaseNewsletterSubscriber {
  id: number;
  email: string;
  name: string | null;
  verified: boolean;
  token: string | null;
  createdAt: Date;
}

// ============================================================================
// 3. AUTHENTICATION & SESSION SCHEMAS
// ============================================================================

export interface AdminSessionPayload {
  role: 'admin';
  timestamp: number;
  expiresAt: number;
}

export interface SupabaseAuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}
