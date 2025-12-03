interface Tender {
  id: number;
  title: string;
  organization: string;
  location: string;
  locationId: string;
  sectors: string[];
  status: string;
  budget: number;
  deadline: string;
  description?: string;
  link?: string;
  applicationLink?: string;
}

interface Filters {
  query?: string;
  locations?: string[];
  sectors?: string[];
  status?: string;
  page?: number;
}

// URL de la API Flask - usar variable de entorno o fallback
// En Next.js, las variables NEXT_PUBLIC_* están disponibles en el cliente
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    // Cliente: usar variable de entorno pública
    return (process.env as any).NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }
  // Servidor: usar variable de entorno
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const mockTenders: Tender[] = [
  {
    id: 1,
    title: 'Proyecto Infraestructura Chile 2025',
    organization: 'Banco Mundial',
    location: 'Chile',
    locationId: '84',
    sectors: ['16', '70'],
    status: 'open',
    budget: 2500000,
    deadline: '2025-12-20'
  },
  {
    id: 2,
    title: 'Proyecto Energía Argentina',
    organization: 'BID',
    location: 'Argentina',
    locationId: '75',
    sectors: ['25'],
    status: 'closed',
    budget: 1800000,
    deadline: '2024-10-15'
  },
  {
    id: 3,
    title: 'Desarrollo Tecnológico Colombia',
    organization: 'CAF',
    location: 'Colombia',
    locationId: '85',
    sectors: ['70'],
    status: 'open',
    budget: 3200000,
    deadline: '2025-08-30'
  },
  {
    id: 4,
    title: 'Infraestructura Vial Perú',
    organization: 'Banco Mundial',
    location: 'Perú',
    locationId: '86',
    sectors: ['16'],
    status: 'open',
    budget: 4500000,
    deadline: '2025-11-15'
  },
  {
    id: 5,
    title: 'Proyecto Agrícola Ecuador',
    organization: 'BID',
    location: 'Ecuador',
    locationId: '87',
    sectors: ['10'],
    status: 'open',
    budget: 1200000,
    deadline: '2025-09-20'
  },
  {
    id: 6,
    title: 'Sistema Educativo Bolivia',
    organization: 'UNESCO',
    location: 'Bolivia',
    locationId: '88',
    sectors: ['15'],
    status: 'draft',
    budget: 800000,
    deadline: '2025-10-10'
  },
  {
    id: 7,
    title: 'Red de Telecomunicaciones Chile',
    organization: 'CAF',
    location: 'Chile',
    locationId: '84',
    sectors: ['70'],
    status: 'open',
    budget: 5500000,
    deadline: '2025-12-31'
  },
  {
    id: 8,
    title: 'Energía Renovable Argentina',
    organization: 'Banco Mundial',
    location: 'Argentina',
    locationId: '75',
    sectors: ['25'],
    status: 'open',
    budget: 3800000,
    deadline: '2025-07-25'
  },
  {
    id: 9,
    title: 'Infraestructura Portuaria Colombia',
    organization: 'BID',
    location: 'Colombia',
    locationId: '85',
    sectors: ['16'],
    status: 'open',
    budget: 6200000,
    deadline: '2025-09-15'
  },
  {
    id: 10,
    title: 'Programa de Salud Perú',
    organization: 'OMS',
    location: 'Perú',
    locationId: '86',
    sectors: ['20'],
    status: 'open',
    budget: 2100000,
    deadline: '2025-08-20'
  },
  {
    id: 11,
    title: 'Tecnología Agrícola Ecuador',
    organization: 'FAO',
    location: 'Ecuador',
    locationId: '87',
    sectors: ['10', '70'],
    status: 'open',
    budget: 1500000,
    deadline: '2025-10-05'
  },
  {
    id: 12,
    title: 'Infraestructura Educativa Bolivia',
    organization: 'Banco Mundial',
    location: 'Bolivia',
    locationId: '88',
    sectors: ['15', '16'],
    status: 'draft',
    budget: 950000,
    deadline: '2025-11-30'
  },
  {
    id: 13,
    title: 'Proyecto Energético Chile',
    organization: 'BID',
    location: 'Chile',
    locationId: '84',
    sectors: ['25'],
    status: 'open',
    budget: 4800000,
    deadline: '2025-12-15'
  },
  {
    id: 14,
    title: 'Digitalización Argentina',
    organization: 'CAF',
    location: 'Argentina',
    locationId: '75',
    sectors: ['70'],
    status: 'closed',
    budget: 2200000,
    deadline: '2024-09-30'
  },
  {
    id: 15,
    title: 'Infraestructura Sanitaria Colombia',
    organization: 'Banco Mundial',
    location: 'Colombia',
    locationId: '85',
    sectors: ['16', '20'],
    status: 'open',
    budget: 3400000,
    deadline: '2025-09-10'
  },
  {
    id: 16,
    title: 'Proyecto Agrícola Sostenible Perú',
    organization: 'FAO',
    location: 'Perú',
    locationId: '86',
    sectors: ['10'],
    status: 'open',
    budget: 1700000,
    deadline: '2025-08-25'
  },
  {
    id: 17,
    title: 'Telecomunicaciones Rurales Ecuador',
    organization: 'BID',
    location: 'Ecuador',
    locationId: '87',
    sectors: ['70'],
    status: 'open',
    budget: 2900000,
    deadline: '2025-10-20'
  },
  {
    id: 18,
    title: 'Energía Solar Bolivia',
    organization: 'Banco Mundial',
    location: 'Bolivia',
    locationId: '88',
    sectors: ['25'],
    status: 'open',
    budget: 4100000,
    deadline: '2025-11-20'
  },
];

export async function fetchTenders(filters: Filters): Promise<{ data: Tender[]; count: number }> {
  try {
    // Construir parámetros de búsqueda
    const params = new URLSearchParams();
    
    if (filters.query) {
      params.set('q', filters.query);
    }
    
    if (filters.locations && filters.locations.length > 0) {
      params.set('locations', filters.locations.join(','));
    }
    
    if (filters.sectors && filters.sectors.length > 0) {
      params.set('sectors', filters.sectors.join(','));
    }
    
    if (filters.status) {
      params.set('status', filters.status);
    }
    
    params.set('page', String(filters.page || 1));
    params.set('per_page', '9');
    
    // Intentar obtener datos de la API Flask
    const response = await fetch(`${API_URL}/api/proyectos?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // En producción, esto debería ser configurado según CORS
      cache: 'no-store',
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return {
          data: result.data,
          count: result.count || 0,
        };
      }
    }
    
    // Si falla la API, usar datos mock como fallback
    console.warn('API no disponible, usando datos mock');
    return fetchTendersMock(filters);
    
  } catch (error) {
    console.error('Error fetching tenders from API:', error);
    // Fallback a datos mock en caso de error
    return fetchTendersMock(filters);
  }
}

function fetchTendersMock(filters: Filters): { data: Tender[]; count: number } {
  let results = mockTenders.filter(t => {
    const matchesQuery = !filters.query ||
      t.title.toLowerCase().includes(filters.query.toLowerCase()) ||
      t.organization.toLowerCase().includes(filters.query.toLowerCase());

    const matchesLoc = !filters.locations || filters.locations.length === 0 ||
      filters.locations.includes(t.locationId);

    const matchesSec = !filters.sectors || filters.sectors.length === 0 ||
      filters.sectors.some(s => t.sectors.includes(s));

    const matchesStatus = !filters.status || t.status === filters.status;

    return matchesQuery && matchesLoc && matchesSec && matchesStatus;
  });

  const pageSize = 9;
  const page = filters.page || 1;
  const start = (page - 1) * pageSize;
  const paged = results.slice(start, start + pageSize);

  return { data: paged, count: results.length };
}
