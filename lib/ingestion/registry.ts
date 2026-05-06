import type { Scraper } from "./types";
import { fiaScraper } from "./scrapers/fia";

export const scrapers: Scraper[] = [
  fiaScraper,
];
