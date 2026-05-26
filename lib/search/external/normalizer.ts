import type { ExternalProjectRecord } from '@/lib/search/external/types';

export interface LinkedInPublicRawRecord {
  id: string;
  title: string;
  organization: string;
  url: string;
  snippet: string;
  postedAt: string;
  deadlineText?: string;
  amountText?: string;
  regionText?: string;
}

export function parseMontoFromText(text: string | undefined): number {
  if (!text) return 0;
  const digits = text.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const value = Number.parseInt(digits, 10);
  return Number.isFinite(value) ? value : 0;
}

function parseDateToYmd(input: string | undefined): string {
  if (!input) return '2099-12-31';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '2099-12-31';
  return d.toISOString().slice(0, 10);
}

function inferAmbito(regionText: string | undefined): 'Regional' | 'Nacional' {
  return regionText?.trim() ? 'Regional' : 'Nacional';
}

function inferEstadoPostulacion(deadlineYmd: string, now = new Date()): 'Abierta' | 'Próxima' | 'Cerrada' {
  const close = new Date(deadlineYmd);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const daysLeft = Math.ceil((close.getTime() - today.getTime()) / 86_400_000);
  if (daysLeft < 0) return 'Cerrada';
  if (daysLeft <= 30) return 'Próxima';
  return 'Abierta';
}

export function normalizeLinkedInPublicRecord(
  record: LinkedInPublicRawRecord,
  syntheticId: number
): ExternalProjectRecord | null {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(record.url);
  } catch {
    return null;
  }

  if (!parsedUrl.hostname.includes('linkedin.com')) return null;

  const fecha_cierre = parseDateToYmd(record.deadlineText || record.postedAt);
  const monto = parseMontoFromText(record.amountText);
  const region = record.regionText?.trim() || undefined;
  const ambito = inferAmbito(region);
  const estadoPostulacion = inferEstadoPostulacion(fecha_cierre);

  return {
    id: syntheticId,
    sourceId: `linkedin_public:${record.id}`,
    nombre: record.title.trim(),
    institucion: record.organization.trim(),
    monto,
    montoTexto: record.amountText ?? null,
    fecha_cierre,
    estado: 'Activa',
    categoria: 'Convocatoria',
    url_bases: record.url,
    ambito,
    estadoPostulacion,
    region,
    regiones: region ? [region] : undefined,
    objetivo: record.snippet,
    descripcionIICA: 'Resultado externo no verificado (LinkedIn público)',
  };
}
