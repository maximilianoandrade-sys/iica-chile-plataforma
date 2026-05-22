/**
 * @jest-environment node
 */
import { worldBankScraper } from "../../../../lib/ingestion/scrapers/world-bank";

global.fetch = jest.fn();

const MOCK_RESPONSE = {
  total: 2,
  rows: "50",
  procnotices: {
    "0": {
      id: "OP00123456",
      notice_type: "Request for Expression of Interest",
      project_name: "Chile Agricultural Modernization Project",
      bid_description: "Consulting services for irrigation systems upgrade in the Maule region.",
      submission_deadline_date: "2026-07-15T23:59:59Z",
      procurement_method_name: "Quality and Cost Based Selection",
      project_ctry_name: "Chile",
      contact_name: "Juan Perez",
      project_id: "P100001",
    },
    "1": {
      id: "OP00789012",
      notice_type: "Invitation for Bids",
      project_name: "Sustainable Agriculture & Climate Resilience",
      bid_description: "Supply of precision farming equipment for smallholders.",
      submission_deadline_date: "2026-08-30T23:59:59Z",
      procurement_method_name: "International Competitive Bidding",
      project_ctry_name: "Chile",
      contact_name: "Maria Gonzalez",
      project_id: "P200002",
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
    expect(first.region).toBe("Chile");
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

  it("reports partial errors for notices missing id", async () => {
    const response = {
      total: 1,
      rows: "50",
      procnotices: {
        "0": {
          // no id field
          project_name: "Orphan Notice",
          bid_description: "No ID here",
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
    expect(result.partialErrors[0]).toContain("sin id");
  });

  it("reports partial errors for notices missing project_name", async () => {
    const response = {
      total: 1,
      rows: "50",
      procnotices: {
        "0": {
          id: "OP00999",
          // no project_name
          bid_description: "Has ID but no title",
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
    expect(result.partialErrors[0]).toContain("OP00999");
    expect(result.partialErrors[0]).toContain("sin project_name");
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

  it("excludes notices from non-Americas countries", async () => {
    const response = {
      total: 2,
      rows: "50",
      procnotices: {
        "0": {
          id: "OP00111111",
          project_name: "China Agriculture Project",
          bid_description: "Some bid",
          submission_deadline_date: "2026-09-01T00:00:00Z",
          project_ctry_name: "China",
          project_id: "P300003",
        },
        "1": {
          id: "OP00222222",
          project_name: "Chile Farming Project",
          bid_description: "Another bid",
          submission_deadline_date: "2026-09-01T00:00:00Z",
          project_ctry_name: "Chile",
          project_id: "P300004",
        },
      },
    };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(response),
    });

    const result = await worldBankScraper.scrape();
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].title).toBe("Chile Farming Project");
  });
});
