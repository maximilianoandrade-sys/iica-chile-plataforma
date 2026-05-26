import {
  AiSearchSchema,
  GenerateProposalSchema,
  SearchProjectsRequestSchema,
  formatZodError,
} from '@/lib/utils/validation';

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

describe('SearchProjectsRequestSchema', () => {
  it('acepta el payload legacy mínimo', () => {
    const result = SearchProjectsRequestSchema.safeParse({ query: 'riego' });
    expect(result.success).toBe(true);
  });

  it('acepta sourceMode y providers válidos', () => {
    const result = SearchProjectsRequestSchema.safeParse({
      query: 'riego',
      sourceMode: 'external',
      providers: ['linkedin_public'],
      ambito: 'Nacional',
      institution: 'INDAP',
      region: 'Maule',
      estado: 'Abierta',
      minAmount: 100000,
      maxAmount: 500000,
      includeUnverified: false,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.sourceMode).toBe('external');
      expect(result.data.providers).toEqual(['linkedin_public']);
    }
  });

  it('rechaza sourceMode inválido', () => {
    const result = SearchProjectsRequestSchema.safeParse({
      query: 'riego',
      sourceMode: 'foo',
    });
    expect(result.success).toBe(false);
  });

  it('rechaza provider inválido', () => {
    const result = SearchProjectsRequestSchema.safeParse({
      query: 'riego',
      sourceMode: 'external',
      providers: ['linkedin'],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza montos negativos', () => {
    const result = SearchProjectsRequestSchema.safeParse({
      query: 'riego',
      minAmount: -1,
    });
    expect(result.success).toBe(false);
  });

  it('rechaza cuando maxAmount es menor que minAmount', () => {
    const result = SearchProjectsRequestSchema.safeParse({
      query: 'riego',
      minAmount: 500,
      maxAmount: 100,
    });
    expect(result.success).toBe(false);
  });

  it('normaliza query y region con trim', () => {
    const result = SearchProjectsRequestSchema.safeParse({
      query: '  agua  ',
      region: '  Maule ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.query).toBe('agua');
      expect(result.data.region).toBe('Maule');
    }
  });
});
