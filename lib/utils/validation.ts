import { z } from 'zod';
import { EXTERNAL_PROVIDER_IDS, SEARCH_SOURCE_MODES } from '@/lib/search/contracts';

/**
 * Schemas Zod compartidos para validación de input en APIs.
 * Importar y usar .safeParse() en route handlers.
 */

export const AiSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, 'El campo query es requerido')
    .max(500, 'La consulta no puede exceder 500 caracteres'),
});

export const GenerateProposalSchema = z.object({
  projectId: z
    .number({ error: 'projectId es requerido y debe ser un número' })
    .int({ error: 'projectId debe ser un entero' })
    .positive({ error: 'projectId debe ser positivo' }),
  applicantInfo: z
    .object({
      name: z.string().max(200, 'Máximo 200 caracteres').optional(),
      organization: z.string().max(200, 'Máximo 200 caracteres').optional(),
      region: z.string().max(200, 'Máximo 200 caracteres').optional(),
    })
    .optional(),
});

const SearchProviderSchema = z.enum(EXTERNAL_PROVIDER_IDS);
const SearchSourceModeSchema = z.enum(SEARCH_SOURCE_MODES);
const SearchAmbitoSchema = z.enum(['all', 'Nacional', 'Regional', 'Internacional']);
const SearchEstadoSchema = z.enum(['Abierta', 'Próxima', 'Cerrada']);
const SearchSortSchema = z.enum(['date_asc', 'amount_desc', 'newest', 'relevance']);

export const SearchProjectsRequestSchema = z
  .object({
    query: z.string().trim().max(500, 'La consulta no puede exceder 500 caracteres').optional(),
    scope: z.string().trim().max(50, 'scope no puede exceder 50 caracteres').optional(),
    role: z.string().trim().max(50, 'role no puede exceder 50 caracteres').optional(),
    ambito: SearchAmbitoSchema.optional(),
    institution: z.string().trim().max(200, 'institution no puede exceder 200 caracteres').optional(),
    region: z.string().trim().max(120, 'region no puede exceder 120 caracteres').optional(),
    estado: SearchEstadoSchema.optional(),
    sort: SearchSortSchema.optional(),
    page: z
      .number({ error: 'page debe ser un número' })
      .int({ error: 'page debe ser entero' })
      .min(1, 'page debe ser mayor o igual a 1')
      .optional(),
    pageSize: z
      .number({ error: 'pageSize debe ser un número' })
      .int({ error: 'pageSize debe ser entero' })
      .min(1, 'pageSize debe ser mayor o igual a 1')
      .max(100, 'pageSize no puede superar 100')
      .optional(),
    minAmount: z
      .number({ error: 'minAmount debe ser un número' })
      .int({ error: 'minAmount debe ser entero' })
      .min(0, 'minAmount no puede ser negativo')
      .optional(),
    maxAmount: z
      .number({ error: 'maxAmount debe ser un número' })
      .int({ error: 'maxAmount debe ser entero' })
      .min(0, 'maxAmount no puede ser negativo')
      .optional(),
    includeUnverified: z.boolean().optional(),
    sourceMode: SearchSourceModeSchema.optional(),
    providers: z.array(SearchProviderSchema).max(5, 'Máximo 5 proveedores').optional(),
    includeMercadoPublico: z.boolean().optional(),
  })
  .refine(
    (data) => data.minAmount == null || data.maxAmount == null || data.maxAmount >= data.minAmount,
    {
      message: 'maxAmount debe ser mayor o igual a minAmount',
      path: ['maxAmount'],
    }
  );

/** Formatea errores Zod en un mensaje amigable en español */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join('. ');
}
