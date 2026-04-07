import { daysUntilClose, isOpen, isClosingSoon, urgencyLabel, formatMontoCLP, viabilidadColors, complejidadColors, rolIICAInfo } from '@/lib/data';
import { Project } from '@/lib/data';

describe('data utilities', () => {
  const mockProject: Project = {
    id: 1,
    nombre: 'Proyecto Test',
    institucion: 'FONTAGRO',
    monto: 500000000,
    fecha_cierre: '2026-12-31',
    estado: 'Abierta',
    categoria: 'Innovacion',
    url_bases: 'https://example.com',
  };

  describe('daysUntilClose', () => {
    it('debe calcular dias hasta cierre correctamente', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const project = { ...mockProject, fecha_cierre: futureDate.toISOString().split('T')[0] };
      
      const days = daysUntilClose(project);
      expect(days).toBeGreaterThanOrEqual(9);
      expect(days).toBeLessThanOrEqual(11);
    });

    it('debe retornar numero negativo si la fecha ya paso', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const project = { ...mockProject, fecha_cierre: pastDate.toISOString().split('T')[0] };
      
      const days = daysUntilClose(project);
      expect(days).toBeLessThan(0);
    });
  });

  describe('isOpen', () => {
    it('debe retornar true si la fecha de cierre es futura', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const project = { ...mockProject, fecha_cierre: futureDate.toISOString().split('T')[0] };
      
      expect(isOpen(project)).toBe(true);
    });

    it('debe retornar false si la fecha de cierre ya paso', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const project = { ...mockProject, fecha_cierre: pastDate.toISOString().split('T')[0] };
      
      expect(isOpen(project)).toBe(false);
    });
  });

  describe('isClosingSoon', () => {
    it('debe retornar true si cierra en 7 dias o menos', () => {
      const soonDate = new Date();
      soonDate.setDate(soonDate.getDate() + 5);
      const project = { ...mockProject, fecha_cierre: soonDate.toISOString().split('T')[0] };
      
      expect(isClosingSoon(project)).toBe(true);
    });

    it('debe retornar false si cierra en mas de 7 dias', () => {
      const laterDate = new Date();
      laterDate.setDate(laterDate.getDate() + 30);
      const project = { ...mockProject, fecha_cierre: laterDate.toISOString().split('T')[0] };
      
      expect(isClosingSoon(project)).toBe(false);
    });
  });

  describe('urgencyLabel', () => {
    it('debe retornar "Cerrada" para fechas pasadas', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const project = { ...mockProject, fecha_cierre: pastDate.toISOString().split('T')[0] };
      
      const label = urgencyLabel(project);
      expect(label.label).toBe('Cerrada');
    });

    it('debe retornar urgencia alta para 3 dias o menos', () => {
      const urgentDate = new Date();
      urgentDate.setDate(urgentDate.getDate() + 2);
      const project = { ...mockProject, fecha_cierre: urgentDate.toISOString().split('T')[0] };
      
      const label = urgencyLabel(project);
      expect(label.color).toBe('text-red-700');
      expect(label.bgColor).toBe('bg-red-100');
    });

    it('debe retornar "Abierta" para mas de 30 dias', () => {
      const openDate = new Date();
      openDate.setDate(openDate.getDate() + 60);
      const project = { ...mockProject, fecha_cierre: openDate.toISOString().split('T')[0] };
      
      const label = urgencyLabel(project);
      expect(label.label).toBe('Abierta');
    });
  });

  describe('formatMontoCLP', () => {
    it('debe formatear montos en miles de millones', () => {
      expect(formatMontoCLP(1500000000)).toBe('$1.5B');
    });

    it('debe formatear montos en millones', () => {
      expect(formatMontoCLP(500000000)).toBe('$500M');
    });

    it('debe retornar "Ver bases" para montos invalidos', () => {
      expect(formatMontoCLP(0)).toBe('Ver bases');
      expect(formatMontoCLP(-100)).toBe('Ver bases');
    });
  });

  describe('viabilidadColors', () => {
    it('debe retornar colores correctos para cada nivel', () => {
      expect(viabilidadColors('Alta')).toEqual({
        text: 'text-green-800',
        bg: 'bg-green-100',
        dot: 'bg-green-500',
      });
      
      expect(viabilidadColors('Media')).toEqual({
        text: 'text-yellow-800',
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
      });
      
      expect(viabilidadColors('Baja')).toEqual({
        text: 'text-red-800',
        bg: 'bg-red-100',
        dot: 'bg-red-500',
      });
    });

    it('debe retornar valores por defecto para nivel undefined', () => {
      const result = viabilidadColors(undefined);
      expect(result.text).toBe('text-gray-600');
    });
  });

  describe('complejidadColors', () => {
    it('debe retornar colores correctos para cada complejidad', () => {
      expect(complejidadColors('Facil')).toEqual({
        text: 'text-green-700',
        bg: 'bg-green-50',
      });
      
      expect(complejidadColors('Media')).toEqual({
        text: 'text-blue-700',
        bg: 'bg-blue-50',
      });
      
      expect(complejidadColors('Alta')).toEqual({
        text: 'text-purple-700',
        bg: 'bg-purple-50',
      });
    });
  });

  describe('rolIICAInfo', () => {
    it('debe retornar informacion correcta para Ejecutor', () => {
      const info = rolIICAInfo('Ejecutor');
      expect(info.text).toBe('text-green-800');
      expect(info.label).toBe('IICA Ejecutor');
    });

    it('debe retornar informacion correcta para Implementador', () => {
      const info = rolIICAInfo('Implementador');
      expect(info.text).toBe('text-blue-800');
      expect(info.label).toBe('IICA Implementador');
    });

    it('debe retornar valores por defecto para rol undefined', () => {
      const info = rolIICAInfo(undefined);
      expect(info.label).toBe('Sin definir');
    });
  });
});
