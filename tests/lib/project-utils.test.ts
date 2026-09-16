import {
  isDeadlineUnknown,
  formatDeadline,
  daysUntilClose,
  isClosingSoon,
  isOpen,
  pluralizeDias,
  urgencyLabel,
  formatMontoCLP,
  displayMonto,
  type Project,
} from '@/lib/project-utils';

describe('lib/project-utils', () => {
  const baseProject: Project = {
    id: 1,
    nombre: 'Fondo de Prueba',
    institucion: 'CNR',
    monto: 50000000,
    montoTexto: '50.000.000 CLP',
    fecha_cierre: '2026-12-31',
    estado: 'Abierta',
    categoria: 'Riego',
    url_bases: 'https://example.com',
  };

  test('isDeadlineUnknown correctly identifies unknown placeholder dates', () => {
    expect(isDeadlineUnknown(null)).toBe(true);
    expect(isDeadlineUnknown(undefined)).toBe(true);
    expect(isDeadlineUnknown('invalid-date')).toBe(true);
    expect(isDeadlineUnknown('2099-12-31')).toBe(true);
    expect(isDeadlineUnknown('2026-08-15')).toBe(false);
  });

  test('formatDeadline handles unknown and regular dates', () => {
    expect(formatDeadline('2099-12-31')).toBe('Sin fecha definida');
    expect(formatDeadline(null)).toBe('Sin fecha definida');
    expect(formatDeadline('2026-08-15')).toContain('2026');
  });

  test('daysUntilClose returns 999 for unknown deadlines', () => {
    const p = { ...baseProject, fecha_cierre: '2099-12-31' };
    expect(daysUntilClose(p)).toBe(999);
  });

  test('displayMonto prioritizes montoTexto when available', () => {
    expect(displayMonto(baseProject)).toBe('50.000.000 CLP');
    const noText = { ...baseProject, montoTexto: null, monto: 15000000 };
    expect(displayMonto(noText)).toBe('$15M');
  });

  test('pluralizeDias formats singular and plural days', () => {
    expect(pluralizeDias(1)).toBe('1 día');
    expect(pluralizeDias(5)).toBe('5 días');
  });
});
