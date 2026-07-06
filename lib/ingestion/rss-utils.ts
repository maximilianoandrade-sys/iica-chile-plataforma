import { load } from "cheerio";
import { getLogger } from "@/lib/utils/logger";
import { cleanText } from "./utils";
import { fetchWithRetry } from "./retry";

const logger = getLogger("RSSUtils");

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date | null;
  categories: string[];
}

export async function fetchRSSFeed(feedUrl: string): Promise<RSSItem[]> {
  logger.info("Fetching RSS feed", { url: feedUrl });
  const res = await fetchWithRetry(
    feedUrl,
    { headers: { "User-Agent": "IICA-Chile-Bot/1.0 (+contacto@iica.cl)" } },
    3,
    600,
  );
  const xml = await res.text();
  const $ = load(xml, { xmlMode: true });
  const items: RSSItem[] = [];

  $("item").each((_, el) => {
    const $item = $(el);
    const title = cleanText($item.find("title").text());
    const link = cleanText($item.find("link").text());
    const description = cleanText($item.find("description").text());
    const pubDateStr = $item.find("pubDate").text().trim();
    const pubDate = pubDateStr ? new Date(pubDateStr) : null;
    const categories: string[] = [];
    $item.find("category").each((_, cat) => {
      categories.push(cleanText($(cat).text()).toLowerCase());
    });

    if (title && link) {
      items.push({
        title,
        link,
        description,
        pubDate: pubDate && !isNaN(pubDate.getTime()) ? pubDate : null,
        categories,
      });
    }
  });

  logger.info("RSS feed parsed", { url: feedUrl, itemCount: items.length });
  return items;
}
