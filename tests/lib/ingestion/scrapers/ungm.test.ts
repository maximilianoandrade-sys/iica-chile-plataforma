/**
 * @jest-environment node
 */
import { ungmScraper } from "../../../../lib/ingestion/scrapers/ungm";

global.fetch = jest.fn();

const MOCK_NOTICES = [
  {
    ReferenceNo: "PROC-2026-001234",
    Title: "Supply of Agricultural Inputs for FAO Chile",
    Description: "Provision of seeds, fertilizers, and pest control supplies for smallholder farmers.",
    OrganizationAcronym: "FAO",
    Deadline: "2026-08-15T23:59:00Z",
    PublishedDate: "2026-05-01T10:00:00Z",
    UNSPSCDescription: "Agriculture and farming",
    NoticeUrl: "/Public/Notice/123456",
  },
  {
    ReferenceNo: "PROC-2026-005678",
    Title: "Consultancy for Sustainable Irrigation in Latin America",
    Description: "Technical advisory for drip irrigation implementation.",
    OrganizationAcronym: "UNDP",
    Deadline: "2026-09-30T17:00:00Z",
    PublishedDate: "2026-05-10T08:00:00Z",
    UNSPSCDescription: "Water resources management",
    NoticeUrl: "/Public/Notice/789012",
  },
];

describe("ungmScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("parses UNGM notice list into RawProject array", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(MOCK_NOTICES),
    });

    const result = await ungmScraper.scrape();

    expect(result.sourceSlug).toBe("ungm");
    expect(result.projects).toHaveLength(2);
    expect(result.partialErrors).toHaveLength(0);

    const first = result.projects[0];
    expect(first.title).toBe("Supply of Agricultural Inputs for FAO Chile");
    expect(first.institution).toBe("FAO (UN)");
    expect(first.url).toBe("https://www.ungm.org/Public/Notice/123456");
    expect(first.canonicalKey).toBe("ungm-PROC-2026-001234");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.deadline!.toISOString()).toBe("2026-08-15T23:59:00.000Z");
    expect(first.ambito).toBe("Internacional");
    expect(first.idioma).toBe("en");
    expect(first.tags).toContain("UNGM");
    expect(first.tags).toContain("FAO");
  });

  it("handles empty array response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("reports partial errors for notices without Title", async () => {
    const notices = [
      {
        ReferenceNo: "NO-TITLE-001",
        Description: "Has description but no title",
        OrganizationAcronym: "WFP",
        Deadline: "2026-12-01T00:00:00Z",
        NoticeUrl: "/Public/Notice/999",
      },
    ];
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(notices),
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(1);
    expect(result.partialErrors[0]).toContain("NO-TITLE-001");
  });

  it("returns error when UNGM API returns non-200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 403");
  });

  it("handles network errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await ungmScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("ECONNREFUSED");
  });
});
