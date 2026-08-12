import type { Project } from '@/lib/data';

export function exportProjectsToCsv(projects: Project[], filename: string = 'Radar_IICA_Chile_Convocatorias.csv'): void {
  if (!projects || projects.length === 0) return;

  const headers = [
    'ID',
    'Nombre Convocatoria',
    'Institucion',
    'Monto',
    'Fecha Cierre',
    'Estado',
    'Categoria',
    'Ambito',
    'Req. Cofinanciamiento',
    'Viabilidad IICA',
    'Rol IICA',
    'Enlace Bases'
  ];

  const escapeCsvField = (field: any): string => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = projects.map(p => [
    p.id,
    p.nombre,
    p.institucion,
    p.montoTexto || (p.monto ? `$${p.monto}` : 'Ver bases'),
    p.fecha_cierre,
    p.estadoPostulacion || p.estado,
    p.categoria,
    p.ambito,
    p.requiere_cofinanciamiento ? 'Sí' : 'No (100% Subvención)',
    p.viabilidadIICA,
    p.rolIICA,
    p.url_bases
  ]);

  const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.map(escapeCsvField).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
