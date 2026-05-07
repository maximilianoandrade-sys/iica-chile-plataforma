export interface RawProject {
  title: string;
  institution: string;
  url: string;
  deadline?: Date | null;
  budget?: string | null;
  description?: string;
  tags?: string[];
  region?: string;
  ambito?: "Nacional" | "Internacional" | "Regional";
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
