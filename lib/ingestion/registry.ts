import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";
import { indapScraper } from "./scrapers/indap";
import { corfoScraper } from "./scrapers/corfo";
import { fontagroScraper } from "./scrapers/fontagro";
import { iicaHemisfericoScraper } from "./scrapers/iica-hemisferico";

export const scrapers: Scraper[] = [
  fiaScraper,
  indapScraper,
  corfoScraper,
  fontagroScraper,
  iicaHemisfericoScraper,
];
