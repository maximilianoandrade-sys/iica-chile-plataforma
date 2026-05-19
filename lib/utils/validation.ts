import { z } from 'zod';

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
    .number({ required_error: 'projectId es requerido', invalid_type_error: 'projectId debe ser un número' })
    .int('projectId debe ser un entero')
    .positive('projectId debe ser positivo'),
  applicantInfo: z
    .object({
      name: z.string().max(200, 'Máximo 200 caracteres').optional(),
      organization: z.string().max(200, 'Máximo 200 caracteres').optional(),
      region: z.string().max(200, 'Máximo 200 caracteres').optional(),
    })
    .optional(),
});

/** Formatea errores Zod en un mensaje amigable en español */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join('. ');
}
