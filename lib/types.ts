export type TenderFilters = { status?: string; agency?: string; search?: string };

export const realTenders = [
  {
    id: 1, title: "FONTAGRO Convocatoria 2026: Cooperación e innovación agroalimentaria", agency: "FONTAGRO/IICA", category: "consulting" as const,
    postedDate: new Date('2025-12-15'), status: "open" as const, location: "América Latina y el Caribe",
    budget: "Variable según proyecto", deadline: new Date('2026-03-30'),
    description: "Consorcios Regionales de I+D+i pueden presentar proyectos hasta 30 marzo 2026 para sistemas agroalimentarios más productivos.",
    link: "https://fontagro.org/es/iniciativas/convocatorias/convocatoria-2026", source: "FONTAGRO"
  },
  {
    id: 2, title: "BID Fortalecer Seguridad Alimentaria Chile", agency: "BID", category: "services" as const,
    postedDate: new Date('2024-01-15'), status: "approval" as const, location: "Chile",
    budget: "$50,000,000", deadline: new Date('2026-12-31'),
    description: "Fortalecimiento INDAP y SAG. Beneficia 300,000 hogares agricultores con herramientas digitales.",
    link: "https://www.iadb.org/en/news/chile-improve-food-security-strengthening-agricultural-services", source: "BID"
  },
  {
    id: 3, title: "FAO Scientific and Navigation Equipment", agency: "FAO", category: "goods" as const,
    postedDate: new Date('2026-01-06'), status: "open" as const, location: "Northern Africa",
    budget: "Refer to tender", deadline: new Date('2026-01-13'),
    description: "Procurement of equipment for agricultural monitoring and research.",
    link: "https://www.fao.org/unfao/procurement/bidding-opportunities/en/", source: "FAO"
  },
  {
    id: 4, title: "FONTAGRO Innovación en Agricultura Familiar", agency: "FONTAGRO/IICA", category: "consulting" as const,
    postedDate: new Date('2025-11-20'), status: "open" as const, location: "América Latina y el Caribe",
    budget: "Hasta $500,000", deadline: new Date('2026-02-15'),
    description: "Proyectos de innovación para mejorar la productividad de la agricultura familiar en la región.",
    link: "https://fontagro.org/es/iniciativas/convocatorias", source: "FONTAGRO"
  },
  {
    id: 5, title: "BID Desarrollo Rural Sostenible", agency: "BID", category: "services" as const,
    postedDate: new Date('2025-10-10'), status: "open" as const, location: "América Latina",
    budget: "$30,000,000", deadline: new Date('2026-06-30'),
    description: "Programa de desarrollo rural sostenible con enfoque en cambio climático y resiliencia.",
    link: "https://www.iadb.org/en/projects", source: "BID"
  },
  {
    id: 6, title: "FAO Climate Smart Agriculture", agency: "FAO", category: "consulting" as const,
    postedDate: new Date('2025-12-01'), status: "open" as const, location: "Global",
    budget: "Variable", deadline: new Date('2026-04-30'),
    description: "Proyectos de agricultura climáticamente inteligente para países en desarrollo.",
    link: "https://www.fao.org/climate-smart-agriculture", source: "FAO"
  },
  {
    id: 7, title: "FONTAGRO Tecnología Agrícola", agency: "FONTAGRO/IICA", category: "works" as const,
    postedDate: new Date('2025-09-15'), status: "approval" as const, location: "América Latina",
    budget: "$2,000,000", deadline: new Date('2026-05-20'),
    description: "Implementación de tecnologías agrícolas avanzadas para pequeños productores.",
    link: "https://fontagro.org/es/proyectos", source: "FONTAGRO"
  },
  {
    id: 8, title: "BID Agua y Saneamiento Rural", agency: "BID", category: "works" as const,
    postedDate: new Date('2025-08-20'), status: "open" as const, location: "Chile, Argentina, Perú",
    budget: "$75,000,000", deadline: new Date('2026-08-15'),
    description: "Infraestructura de agua potable y saneamiento para comunidades rurales.",
    link: "https://www.iadb.org/en/sector/water-and-sanitation", source: "BID"
  },
  {
    id: 9, title: "FAO Food Security Program", agency: "FAO", category: "services" as const,
    postedDate: new Date('2025-11-05'), status: "open" as const, location: "América Latina y el Caribe",
    budget: "$40,000,000", deadline: new Date('2026-07-31'),
    description: "Programa integral de seguridad alimentaria y nutrición para poblaciones vulnerables.",
    link: "https://www.fao.org/food-security", source: "FAO"
  },
  {
    id: 10, title: "FONTAGRO Bioeconomía Circular", agency: "FONTAGRO/IICA", category: "consulting" as const,
    postedDate: new Date('2025-10-25'), status: "open" as const, location: "América Latina",
    budget: "Hasta $1,500,000", deadline: new Date('2026-03-15'),
    description: "Proyectos de bioeconomía circular para valorizar residuos agrícolas y forestales.",
    link: "https://fontagro.org/es/iniciativas", source: "FONTAGRO"
  },
  {
    id: 11, title: "BID Digitalización Agropecuaria", agency: "BID", category: "services" as const,
    postedDate: new Date('2025-12-10'), status: "open" as const, location: "Chile",
    budget: "$25,000,000", deadline: new Date('2026-09-30'),
    description: "Transformación digital del sector agropecuario con tecnologías 4.0.",
    link: "https://www.iadb.org/en/sector/agriculture", source: "BID"
  },
  {
    id: 12, title: "FAO Sustainable Fisheries", agency: "FAO", category: "consulting" as const,
    postedDate: new Date('2025-09-30'), status: "approval" as const, location: "América Latina y el Caribe",
    budget: "$15,000,000", deadline: new Date('2026-06-15'),
    description: "Conservación y manejo sostenible de recursos pesqueros y acuícolas.",
    link: "https://www.fao.org/fisheries", source: "FAO"
  }
];

