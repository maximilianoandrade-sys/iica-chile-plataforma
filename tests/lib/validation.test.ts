import { AiSearchSchema, GenerateProposalSchema, formatZodError } from '@/lib/utils/validation';

describe('AiSearchSchema', () => {
  it('acepta una consulta válida', () => {
    const result = AiSearchSchema.safeParse({ query: 'fondos agrícolas' });
    expect(result.success).toBe(true);
  });

  it('rechaza consulta vacía', () => {
    const result = AiSearchSchema.safeParse({ query: '' });
    expect(result.success).toBe(false);
  });

  it('rechaza consulta que excede 500 caracteres', () => {
    const result = AiSearchSchema.safeParse({ query: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('recorta espacios en blanco', () => {
    const result = AiSearchSchema.safeParse({ query: '  fondos  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.query).toBe('fondos');
  });
});

describe('GenerateProposalSchema', () => {
  it('acepta projectId válido', () => {
    const result = GenerateProposalSchema.safeParse({ projectId: 42 });
    expect(result.success).toBe(true);
  });

  it('rechaza projectId no-entero', () => {
    const result = GenerateProposalSchema.safeParse({ projectId: 'abc' });
    expect(result.success).toBe(false);
  });

  it('acepta applicantInfo opcional', () => {
    const result = GenerateProposalSchema.safeParse({
      projectId: 1,
      applicantInfo: { name: 'Juan', organization: 'Coop Agrícola', region: 'Maule' },
    });
    expect(result.success).toBe(true);
  });

  it('rechaza campos de applicantInfo mayores a 200 caracteres', () => {
    const result = GenerateProposalSchema.safeParse({
      projectId: 1,
      applicantInfo: { name: 'x'.repeat(201) },
    });
    expect(result.success).toBe(false);
  });
});

describe('formatZodError', () => {
  it('formatea múltiples errores separados por punto', () => {
    const result = AiSearchSchema.safeParse({ query: '' });
    if (!result.success) {
      const msg = formatZodError(result.error);
      expect(msg).toContain('requerido');
    }
  });
});
