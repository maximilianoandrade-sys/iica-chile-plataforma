/**
 * Tipos compartidos para el sistema de scraping
 */

export interface ScrapedProject {
  sourceId: string;          // ID único: "fuente:slug" (ej: "anid:fondecyt-regular-2027")
  nombre: string;
  institucion: string;
  monto: number;             // En CLP. 0 si no se puede determinar
  fecha_cierre: Date;
  estado: string;            // "Abierto" | "Cerrado" | "Próximo"
  categoria: string;         // "Nacional" | "Internacional" | "Regional"
  url_bases: string;         // URL directa a las bases/convocatoria
  regiones: string[];
  beneficiarios: string[];
  objetivo?: string;
}

export interface ScraperSource {
  id: string;
  name: string;
  url: string;
  institucion: string;
  scrape: () => Promise<ScrapedProject[]>;
}

export interface ScrapeResult {
  source: string;
  projects: ScrapedProject[];
  errors: string[];
  durationMs: number;
}
