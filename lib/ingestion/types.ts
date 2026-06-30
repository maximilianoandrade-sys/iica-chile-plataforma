export interface RawProject {
  title: string;
  institution: string;
  url: string;
  /**
   * URL alternativa que el scraper usa SOLO para identificar el proyecto
   * unívocamente en DB (canonical key). Se usa cuando `url` (la que ve el
   * usuario) puede repetirse entre proyectos — por ejemplo, CNR apunta
   * varios concursos futuros al mismo listing URL. Si no se setea, se
   * usa `url` para el canonical.
   */
  canonicalKey?: string;
  deadline?: Date | null;
  budget?: string | null;
  description?: string;
  tags?: string[];
  opportunityType?: "Convocatoria" | "Licitacion" | "Programa";
  region?: string;
  ambito?: "Nacional" | "Internacional" | "Regional";
  idioma?: "es" | "en" | "pt" | "fr";
  /** Whether this project is relevant to Chile (for Internacional projects) */
  relevanciaChile?: boolean;
}

export interface ScraperResult {
  sourceSlug: string;
  projects: RawProject[];
  partialErrors: string[];
}

export interface Scraper {
  slug: string;
  name: string;
  homepageUrl: string;
  scrape(): Promise<ScraperResult>;
}

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}
