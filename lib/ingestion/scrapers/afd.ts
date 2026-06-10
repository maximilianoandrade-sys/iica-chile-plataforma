/**
 * Scraper AFD — Agence Française de Développement.
 *
 * Strategy: Fetch /fr/appels-a-projets (static Drupal HTML).
 * Lists active programs with call-for-proposals links.
 * Focus on programs relevant to Latin America + agriculture.
 */
import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import type { Scraper, ScraperResult, RawProject } from "../types";
import { cleanText, absoluteUrl } from "../utils";
import { fetchWithRetry } from "../retry";

const logger = getLogger("AFDScraper");

const BASE_URL = "https://www.afd.fr/fr/appels-a-projets";
const HOMEPAGE = "https://www.afd.fr/fr/appels-a-projets";

export const afdScraper: Scraper = {
  slug: "afd",
  name: "AFD — Agence Française de Développement",
  homepageUrl: HOMEPAGE,

  async scrape(): Promise<ScraperResult> {
    const sourceSlug = this.slug;
    const projects: RawProject[] = [];
    const partialErrors: string[] = [];

    try {
      const res = await fetchWithRetry(
        BASE_URL,
        {
          headers: {
            "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)",
          },
        },
        3,
        600,
      );
      const html = await res.text();
      const $ = load(html);

      // AFD lists programs/calls as card-like elements or list entries
      $(
        "a[href*='appel'], a[href*='projet'], article, .node, .card, .view-row, li",
      ).each((_, el) => {
        try {
          const $el = $(el);
          const $link = $el.is("a") ? $el : $el.find("a").first();
          const href = $link.attr("href");
          if (!href) return;

          const url = absoluteUrl(href, "https://www.afd.fr/");
          if (!url.includes("afd.fr")) return;
          // Only keep call/project pages
          if (
            !url.includes("appel") &&
            !url.includes("projet") &&
            !url.includes("initiative")
          )
            return;

          const title = cleanText(
            $el
              .find("h2, h3, h4, .title, .field--name-title")
              .first()
              .text() || $link.text(),
          );
          if (!title || title.length < 10) return;

          const description = cleanText(
            $el
              .find("p, .field--name-body, .summary, .description")
              .first()
              .text(),
          );

          // Try to find budget mentions
          const text = $el.text();
          const budgetMatch = text.match(
            /(\d[\d\s,.]*)\s*(million|M€|MEUR)/i,
          );
          const budget = budgetMatch
            ? `EUR ${budgetMatch[1].trim()} million`
            : null;

          projects.push({
            title,
            institution: "AFD (France)",
            url,
            canonicalKey: url,
            deadline: null, // Deadlines in individual call detail pages
            budget,
            description: description
              ? description.slice(0, 300)
              : undefined,
            tags: ["AFD", "France", "Development"],
            ambito: "Internacional",
            idioma: "fr",
            opportunityType: "Convocatoria",
          });
        } catch (err) {
          partialErrors.push(
            `AFD parse: ${(err as Error).message}`,
          );
        }
      });

      // Deduplicate
      const unique = new Map<string, RawProject>();
      for (const p of projects) {
        const key = p.canonicalKey || p.url;
        if (!unique.has(key)) unique.set(key, p);
      }
      projects.length = 0;
      projects.push(...Array.from(unique.values()));

      if (projects.length === 0) {
        partialErrors.push(
          "No AFD calls found — page structure may have changed",
        );
      }

      logger.info("AFD scrape completed", { count: projects.length });
    } catch (err) {
      logger.error("AFD scrape failed", {
        error: (err as Error).message,
      });
      return {
        sourceSlug,
        projects: [],
        partialErrors: [(err as Error).message],
      };
    }

    return { sourceSlug, projects, partialErrors };
  },
};
