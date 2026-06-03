/**
 * @jest-environment node
 */
import { tedNoticesScraper } from "@/lib/ingestion/scrapers/ted-notices";

global.fetch = jest.fn();

const TED_RESPONSE = {
  notices: [
    {
      "publication-number": "123456-2026",
      "publication-date": "2026-06-03+02:00",
      "notice-title": {
        eng: "Chile - Agricultural advisory services for irrigation resilience",
      },
      "buyer-name": {
        eng: ["Ministry of Agriculture Chile"],
      },
      "place-of-performance-country-proc": ["CHL"],
      "deadline-receipt-tender-date-lot": ["2026-07-20+02:00"],
      links: {
        htmlDirect: {
          ENG: "https://ted.europa.eu/en/notice/123456-2026/html",
        },
        pdf: {
          ENG: "https://ted.europa.eu/en/notice/123456-2026/pdf",
        },
      },
    },
    {
      "publication-number": "999999-2026",
      "publication-date": "2026-06-03+02:00",
      "notice-title": {
        eng: "Germany - Agricultural machinery maintenance",
      },
      "buyer-name": {
        eng: ["State Procurement Office"],
      },
      "place-of-performance-country-proc": ["DEU"],
      links: {
        htmlDirect: {
          ENG: "https://ted.europa.eu/en/notice/999999-2026/html",
        },
      },
    },
  ],
  totalNoticeCount: 2,
  iterationNextToken: null,
  timedOut: false,
};

describe("tedNoticesScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps TED API notices to RawProject and filters to IICA Americas", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(TED_RESPONSE),
    });

    const result = await tedNoticesScraper.scrape();

    expect(result.sourceSlug).toBe("ted-notices");
    expect(result.partialErrors).toHaveLength(0);
    expect(result.projects).toHaveLength(1);

    const first = result.projects[0];
    expect(first.title).toContain("Chile");
    expect(first.institution).toBe("Ministry of Agriculture Chile");
    expect(first.url).toBe("https://ted.europa.eu/en/notice/123456-2026/html");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.ambito).toBe("Internacional");
    expect(first.idioma).toBe("en");
    expect(first.tags).toContain("TED");
    expect(first.tags).toContain("Licitacion");
    expect(first.region).toBe("Chile");
  });

  it("returns partial error on non-200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });

    const result = await tedNoticesScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors[0]).toContain("HTTP 500");
  });
});
