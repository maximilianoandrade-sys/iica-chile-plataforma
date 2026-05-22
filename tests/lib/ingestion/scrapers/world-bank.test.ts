/**
 * @jest-environment node
 */
import { worldBankScraper } from "../../../../lib/ingestion/scrapers/world-bank";

global.fetch = jest.fn();

const MOCK_RESPONSE = {
  total: 2,
  rows: "50",
  procnotices: {
    "1001": {
      id: "1001",
      notice_type: "Request for Expression of Interest",
      project_name: "Chile Agricultural Modernization Project",
      bid_description: "Consulting services for irrigation systems upgrade in the Maule region.",
      submission_deadline_date: "2026-07-15T23:59:59Z",
      procurement_method_name: "Quality and Cost Based Selection",
      noticeurl: "https://projects.worldbank.org/en/projects-operations/procurement-detail/OP00123456",
      contact_name: "Juan Perez",
      borrower_country: "Chile",
    },
    "1002": {
      id: "1002",
      notice_type: "Invitation for Bids",
      project_name: "Sustainable Agriculture & Climate Resilience",
      bid_description: "Supply of precision farming equipment for smallholders.",
      submission_deadline_date: "2026-08-30T23:59:59Z",
      procurement_method_name: "International Competitive Bidding",
      noticeurl: "https://projects.worldbank.org/en/projects-operations/procurement-detail/OP00789012",
      contact_name: "Maria Gonzalez",
      borrower_country: "Chile",
    },
  },
};

describe("worldBankScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses World Bank API response into RawProject array", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_RESPONSE),
    });

    const result = await worldBankScraper.scrape();

    expect(result.sourceSlug).toBe("world-bank");
    expect(result.projects).toHaveLength(2);
    expect(result.partialErrors).toHaveLength(0);

    const first = result.projects[0];
    expect(first.title).toBe("Chile Agricultural Modernization Project");
    expect(first.institution).toBe("World Bank");
    expect(first.url).toBe("https://projects.worldbank.org/en/projects-operations/procurement-detail/OP00123456");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.deadline!.toISOString()).toBe("2026-07-15T23:59:59.000Z");
    expect(first.ambito).toBe("Internacional");
    expect(first.idioma).toBe("en");
    expect(first.description).toContain("irrigation systems");
    expect(first.tags).toContain("World Bank");
    expect(first.tags).toContain("Request for Expression of Interest");
  });

  it("handles empty procnotices object", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ total: 0, rows: "50", procnotices: {} }),
    });

    const result = await worldBankScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("reports partial errors for notices missing noticeurl", async () => {
    const response = {
      total: 1,
      rows: "50",
      procnotices: {
        "2001": {
          id: "2001",
          project_name: "Orphan Notice",
          bid_description: "No URL here",
        },
      },
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const result = await worldBankScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(1);
    expect(result.partialErrors[0]).toContain("2001");
  });

  it("returns error when API returns non-200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
    });

    const result = await worldBankScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 503");
  });

  it("handles fetch timeout/abort gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("AbortError"));

    const result = await worldBankScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("AbortError");
  });
});
