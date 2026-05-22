/**
 * @jest-environment node
 */
import { ungmScraper, parseUngmHtml } from "../../../../lib/ingestion/scrapers/ungm";

global.fetch = jest.fn();

const MOCK_HTML_FRAGMENT = `
<div role="row" tabindex="0" data-noticeid="301877" class="tableRow dataRow notice-table">
    <div role="cell" class="tableCell editable intendbuttonsHeader resultOptions"></div>
    <div role="cell" class="tableCell resultTitle">
        <div class="ungm-flex-row ungm-flex-row--space-between">
            <div class="ungm-flex-row">
                <span class="ungm-title ungm-title--small">
                    FAOTZ/ITB/2026/015 - Supervision of Construction and Rehabilitation Works
                </span>
            </div>
            <a target='_blank' href='/Public/Notice/301877'></a>
        </div>
    </div>
    <div role="cell" class="tableCell resultInfo1 deadline" data-description="Deadline">
        <span>14-Jun-2026 23:30 (GMT 3.00)</span>
        <span class="remainingDaysToDeadline" style="display:none">23.1</span>
    </div>
    <div role="cell" class="tableCell"><span>22-May-2026</span></div>
    <div role="cell" class="tableCell resultAgency"><span>FAO</span></div>
    <div role="cell" class="tableCell"><span><label for='Invitation to bid'>Invitation to bid</label></span></div>
    <div role="cell" class="tableCell resultInfo1" data-description="Reference"><span>2026/FRURT/FRURT/136955</span></div>
    <div role="cell" class="tableCell"><span>Tanzania, United Republic of</span></div>
</div>
<div role="row" tabindex="0" data-noticeid="301500" class="tableRow dataRow notice-table">
    <div role="cell" class="tableCell editable intendbuttonsHeader resultOptions"></div>
    <div role="cell" class="tableCell resultTitle">
        <div class="ungm-flex-row ungm-flex-row--space-between">
            <div class="ungm-flex-row">
                <span class="ungm-title ungm-title--small">
                    Consultancy for Sustainable Irrigation in Latin America
                </span>
            </div>
        </div>
    </div>
    <div role="cell" class="tableCell resultInfo1 deadline" data-description="Deadline">
        <span>30-Sep-2026 17:00 (GMT -3.00)</span>
    </div>
    <div role="cell" class="tableCell"><span>10-May-2026</span></div>
    <div role="cell" class="tableCell resultAgency"><span>UNDP</span></div>
    <div role="cell" class="tableCell"><span><label>Request for Proposal</label></span></div>
    <div role="cell" class="tableCell resultInfo1" data-description="Reference"><span>RFP-2026-005678</span></div>
    <div role="cell" class="tableCell"><span>Chile</span></div>
</div>
`;

describe("ungmScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseUngmHtml", () => {
    it("parses HTML fragment into structured notices", () => {
      const notices = parseUngmHtml(MOCK_HTML_FRAGMENT);
      expect(notices).toHaveLength(2);

      expect(notices[0].noticeId).toBe("301877");
      expect(notices[0].title).toContain("Supervision of Construction");
      expect(notices[0].deadline).toContain("14-Jun-2026");
      expect(notices[0].agency).toBe("FAO");
      expect(notices[0].reference).toBe("2026/FRURT/FRURT/136955");
      expect(notices[0].country).toBe("Tanzania, United Republic of");

      expect(notices[1].noticeId).toBe("301500");
      expect(notices[1].title).toBe("Consultancy for Sustainable Irrigation in Latin America");
      expect(notices[1].agency).toBe("UNDP");
      expect(notices[1].reference).toBe("RFP-2026-005678");
      expect(notices[1].country).toBe("Chile");
    });
  });

  it("parses UNGM HTML response into RawProject array, filtering non-Americas", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(MOCK_HTML_FRAGMENT),
    });

    const result = await ungmScraper.scrape();

    expect(result.sourceSlug).toBe("ungm");
    // Tanzania is filtered out, only Chile remains
    expect(result.projects).toHaveLength(1);
    expect(result.partialErrors).toHaveLength(0);

    const first = result.projects[0];
    expect(first.title).toContain("Sustainable Irrigation");
    expect(first.institution).toBe("UNDP (UN)");
    expect(first.url).toBe("https://www.ungm.org/Public/Notice/301500");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.ambito).toBe("Internacional");
    expect(first.idioma).toBe("en");
    expect(first.tags).toContain("UNGM");
    expect(first.tags).toContain("UNDP");
  });

  it("includes notices with no country (err on side of inclusion)", async () => {
    const htmlNoCountry = `
<div role="row" tabindex="0" data-noticeid="999999" class="tableRow dataRow notice-table">
    <div role="cell" class="tableCell resultTitle">
        <div class="ungm-flex-row ungm-flex-row--space-between">
            <div class="ungm-flex-row">
                <span class="ungm-title ungm-title--small">
                    Agriculture supply unknown location
                </span>
            </div>
        </div>
    </div>
    <div role="cell" class="tableCell resultInfo1 deadline" data-description="Deadline">
        <span>01-Jan-2027 12:00</span>
    </div>
    <div role="cell" class="tableCell resultAgency"><span>WFP</span></div>
    <div role="cell" class="tableCell resultInfo1" data-description="Reference"><span>REF-001</span></div>
</div>`;
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(htmlNoCountry),
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].title).toContain("Agriculture supply unknown location");
  });

  it("handles empty HTML response", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<div>No results</div>"),
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toHaveLength(0);
  });

  it("returns error when UNGM returns non-200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("HTTP 403");
  });

  it("returns error when full HTML page received (redirect)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<!DOCTYPE html><html><body>Login page</body></html>"),
    });

    const result = await ungmScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("full HTML page");
  });

  it("handles network errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await ungmScraper.scrape();
    expect(result.projects).toEqual([]);
    expect(result.partialErrors[0]).toContain("ECONNREFUSED");
  });
});
