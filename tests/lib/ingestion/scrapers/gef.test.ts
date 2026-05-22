/**
 * @jest-environment node
 */
import { gefScraper } from "@/lib/ingestion/scrapers/gef";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const HTML_PAGE = `
<html><body><table><tbody>
<tr>
  <td><a href="/projects-operations/projects/12320">Enabling Activities for BBNJ</a></td>
  <td>12320</td>
  <td>China, St. Kitts And Nevis, Tonga, Paraguay, Global</td>
  <td>International Waters</td>
  <td>Enabling Activity</td>
  <td>Food and Agriculture Organization</td>
  <td>700,000</td>
  <td></td>
  <td>Project Approved</td>
</tr>
<tr>
  <td><a href="/projects-operations/projects/99999">African Biodiversity</a></td>
  <td>99999</td>
  <td>Kenya, Tanzania</td>
  <td>Biodiversity</td>
  <td>Full-Size Project</td>
  <td>UNEP</td>
  <td>1,500,000</td>
  <td></td>
  <td>Project Approved</td>
</tr>
<tr>
  <td><a href="/projects-operations/projects/55555">Chile Climate</a></td>
  <td>55555</td>
  <td>Chile</td>
  <td>Climate Change</td>
  <td>Full-Size Project</td>
  <td>UNDP</td>
  <td>2,639,726</td>
  <td></td>
  <td>Completed</td>
</tr>
<tr>
  <td><a href="/projects-operations/projects/77777">Brazil Forests</a></td>
  <td>77777</td>
  <td>Brazil</td>
  <td>Land Degradation, Biodiversity</td>
  <td>Full-Size Project</td>
  <td>World Bank</td>
  <td>3,000,000</td>
  <td></td>
  <td>Concept Approved</td>
</tr>
</tbody></table></body></html>
`;

function mockResponse(body: string, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
    json: async () => JSON.parse(body),
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("GEF Scraper", () => {
  it("parses projects from HTML table correctly", async () => {
    // CSV fails, HTML succeeds
    mockFetch
      .mockResolvedValueOnce(mockResponse("", 403)) // CSV
      .mockResolvedValueOnce(mockResponse(HTML_PAGE)) // page 0
      .mockResolvedValueOnce(mockResponse(HTML_PAGE)); // page 1

    const result = await gefScraper.scrape();

    // Paraguay and St. Kitts (row 1) + Brazil (row 4) are Americas
    // Row 2 (Kenya/Tanzania) excluded, Row 3 (Chile) excluded (Completed status)
    expect(result.sourceSlug).toBe("gef");
    // Each page has 2 matching projects, 2 pages = 4
    expect(result.projects.length).toBe(4);

    const first = result.projects[0];
    expect(first.title).toBe("Enabling Activities for BBNJ");
    expect(first.url).toBe(
      "https://www.thegef.org/projects-operations/projects/12320"
    );
    expect(first.institution).toBe("Food and Agriculture Organization");
    expect(first.budget).toBe("USD 700,000");
    expect(first.idioma).toBe("en");
    expect(first.ambito).toBe("Internacional");
  });

  it("filters to Americas only", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse("", 403))
      .mockResolvedValueOnce(mockResponse(HTML_PAGE))
      .mockResolvedValueOnce(mockResponse(HTML_PAGE));

    const result = await gefScraper.scrape();

    // No project with only Kenya/Tanzania should appear
    const titles = result.projects.map((p) => p.title);
    expect(titles).not.toContain("African Biodiversity");
  });

  it("only includes active projects", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse("", 403))
      .mockResolvedValueOnce(mockResponse(HTML_PAGE))
      .mockResolvedValueOnce(mockResponse(HTML_PAGE));

    const result = await gefScraper.scrape();

    // Chile Climate is "Completed" so excluded
    const titles = result.projects.map((p) => p.title);
    expect(titles).not.toContain("Chile Climate");
    // Brazil Forests is "Concept Approved" so included
    expect(titles).toContain("Brazil Forests");
  });

  it("handles fetch errors gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await gefScraper.scrape();

    expect(result.sourceSlug).toBe("gef");
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors.length).toBeGreaterThan(0);
  });

  it("constructs correct project URLs", async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse("", 403))
      .mockResolvedValueOnce(mockResponse(HTML_PAGE))
      .mockResolvedValueOnce(mockResponse(HTML_PAGE));

    const result = await gefScraper.scrape();

    for (const project of result.projects) {
      expect(project.url).toMatch(
        /^https:\/\/www\.thegef\.org\/projects-operations\/projects\/\d+$/
      );
    }
  });
});
