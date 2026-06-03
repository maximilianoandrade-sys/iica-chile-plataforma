/**
 * @jest-environment node
 */
import { devexFundingScraper } from "@/lib/ingestion/scrapers/devex-funding";

global.fetch = jest.fn();

describe("devexFundingScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps Devex funding API records and filters to IICA Americas", async () => {
    const payload = {
      total: 2,
      page: {
        number: 1,
        size: 10,
        pages: 1,
        next_url: null,
      },
      data: [
        {
          id: 877050,
          type: "tender",
          title: "Design Blended Financial Instrument for the Amazonian Bioeconomy (RFI)",
          places: [{ name: "Chile" }],
          deadline: "2026-06-12",
          updated_at: "2026-06-02T09:38:32.856+00:00",
          status: "forecast",
          summarized_description: "<p>Opportunity <strong>Background</strong></p>",
        },
        {
          id: 877999,
          type: "tender",
          title: "Germany irrigation consulting",
          places: [{ name: "Germany" }],
          deadline: "2026-06-30",
          updated_at: "2026-06-01T10:00:00.000+00:00",
          status: "open",
          summarized_description: "<p>Not in Americas</p>",
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(payload)),
    });

    const result = await devexFundingScraper.scrape();

    expect(result.sourceSlug).toBe("devex-funding");
    expect(result.partialErrors).toHaveLength(0);
    expect(result.projects).toHaveLength(1);

    const first = result.projects[0];
    expect(first.title).toContain("Design Blended Financial Instrument");
    expect(first.institution).toBe("Devex");
    expect(first.url).toBe("https://www.devex.com/funding/r?report=tender-877050");
    expect(first.canonicalKey).toBe("devex:tender:877050");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.opportunityType).toBe("Licitacion");
    expect(first.region).toBe("Chile");
    expect(first.tags).toContain("Devex");
  });

  it("uses updated_at as fallback deadline when deadline is null", async () => {
    const payload = {
      total: 1,
      page: { number: 1, size: 10, pages: 1, next_url: null },
      data: [
        {
          id: 98717,
          type: "pipeline",
          title: "Support for Improving Authorizations to Accelerate Investments in Chile",
          places: [{ name: "Chile" }],
          deadline: null,
          updated_at: "2026-05-27T05:36:47.156+00:00",
          status: "open",
          summarized_description: "<p>Opportunity Background</p>",
        },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(payload)),
    });

    const result = await devexFundingScraper.scrape();
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].deadline).toBeInstanceOf(Date);
    expect(result.projects[0].opportunityType).toBe("Programa");
  });

  it("returns partial error on non-200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("{}"),
    });

    const result = await devexFundingScraper.scrape();

    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors[0]).toContain("HTTP 500");
  });

  it("returns partial error when anti-bot challenge payload is returned", async () => {
    const challenge = {
      url: "https://geo.captcha-delivery.com/captcha/?initialCid=abc",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(challenge)),
    });

    const result = await devexFundingScraper.scrape();

    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(1);
    expect(result.partialErrors[0]).toContain("captcha");
  });
});
