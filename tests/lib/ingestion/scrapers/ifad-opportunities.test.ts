/**
 * @jest-environment node
 */
import { ifadOpportunitiesScraper } from "@/lib/ingestion/scrapers/ifad-opportunities";

global.fetch = jest.fn();

const IFAD_OPPORTUNITIES_HTML = `
<div id="_UNDB_PORTLET_INSTANCE_rhef_undbItemsSearchContainer">
  <table><tbody>
    <tr>
      <td>
        <div class="undb-content">
          <h4 class="undb-title">General Procurement Notice - INNOVASAN - Honduras (2000003900) - 2026 <small>(v 2.0)</small></h4>
          <div class="undb-meta-data"><b>Publish Date:</b> 29 May 2026 - 06:57 (GMT)</div>
          <div class="undb-meta-data"><b>Country:</b> Honduras</div>
          <div class="undb-meta-data"><b>Project :</b> #2000003900 - Strengthening innovation</div>
          <div class="undb-meta-data mt-4">
            <a class="btn btn-outline-primary btn-sm" href="https://www.ifad.org/en/project-procurement/opportunities?p_p_id=UNDB_PORTLET_INSTANCE_rhef&p_p_lifecycle=2&_UNDB_PORTLET_INSTANCE_rhef_db_ref_no=356">Download PDF</a>
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="undb-content">
          <h4 class="undb-title">Specific Procurement Notice - DESATAR - Ecuador (2000002282) - 2026 <small>(v 1.0)</small></h4>
          <div class="undb-meta-data"><b>Publish Date:</b> 07 Apr 2026 - 05:24 (GMT)</div>
          <div class="undb-meta-data"><b>Country:</b> Ecuador</div>
          <div class="undb-meta-data"><b>Project :</b> #2000002282 - Sustainable and Appropriate Development</div>
          <div class="undb-meta-data mt-4">
            <a class="btn btn-outline-primary btn-sm" href="https://www.ifad.org/en/project-procurement/opportunities?p_p_id=UNDB_PORTLET_INSTANCE_bvwb&p_p_lifecycle=2&_UNDB_PORTLET_INSTANCE_bvwb_db_ref_no=328">Download PDF</a>
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="undb-content">
          <h4 class="undb-title">General Procurement Notice - ProMIFA - Togo (2000001051) - 2026 <small>(v 2.0)</small></h4>
          <div class="undb-meta-data"><b>Publish Date:</b> 28 May 2026 - 09:21 (GMT)</div>
          <div class="undb-meta-data"><b>Country:</b> Togo</div>
          <div class="undb-meta-data mt-4">
            <a class="btn btn-outline-primary btn-sm" href="https://www.ifad.org/en/project-procurement/opportunities?p_p_id=UNDB_PORTLET_INSTANCE_rhef&p_p_lifecycle=2&_UNDB_PORTLET_INSTANCE_rhef_db_ref_no=353">Download PDF</a>
          </div>
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="undb-content">
          <h4 class="undb-title">Contract Award Notice - FIRIP - Zambia (2000004924) <small>(v 1.0)</small></h4>
          <div class="undb-meta-data"><b>Publish Date:</b> 14 May 2026 - 04:16 (GMT)</div>
          <div class="undb-meta-data"><b>Country:</b> Zambia</div>
          <div class="undb-meta-data mt-4">
            <a class="btn btn-outline-primary btn-sm" href="https://www.ifad.org/en/project-procurement/opportunities?p_p_id=UNDB_PORTLET_INSTANCE_cule&p_p_lifecycle=2&_UNDB_PORTLET_INSTANCE_cule_db_ref_no=49">Download PDF</a>
          </div>
        </div>
      </td>
    </tr>
  </tbody></table>
</div>
`;

const UNGM_IFAD_FALLBACK_HTML = `
<div role="row" tabindex="0" data-noticeid="301566" class="tableRow dataRow notice-table">
  <div role="cell" class="tableCell resultTitle">
    <span class="ungm-title ungm-title--small">Provision of Insurance for Rural Resilience & Economic Development</span>
  </div>
  <div role="cell" class="tableCell resultInfo1 deadline" data-description="Deadline">
    <span>17-Jun-2026 11:00 (GMT 2.00)</span>
  </div>
  <div role="cell" class="tableCell"><span>20-May-2026</span></div>
  <div role="cell" class="tableCell resultAgency"><span>IFAD</span></div>
  <div role="cell" class="tableCell"><span><label>Request for proposal</label></span></div>
  <div role="cell" class="tableCell resultInfo1" data-description="Reference"><span>IFAD/2026/011/RFP</span></div>
  <div role="cell" class="tableCell"><span>Honduras</span></div>
</div>
<div role="row" tabindex="0" data-noticeid="301090" class="tableRow dataRow notice-table">
  <div role="cell" class="tableCell resultTitle">
    <span class="ungm-title ungm-title--small">Consulting services for IFAD portfolio support</span>
  </div>
  <div role="cell" class="tableCell resultInfo1 deadline" data-description="Deadline">
    <span>19-Jun-2026 15:00 (GMT 1.00)</span>
  </div>
  <div role="cell" class="tableCell"><span>21-May-2026</span></div>
  <div role="cell" class="tableCell resultAgency"><span>IFAD</span></div>
  <div role="cell" class="tableCell"><span><label>Request for quotation</label></span></div>
  <div role="cell" class="tableCell resultInfo1" data-description="Reference"><span>IFAD/2026/099/RFQ</span></div>
  <div role="cell" class="tableCell"><span>Italy</span></div>
</div>
`;

describe("ifadOpportunitiesScraper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ingests IFAD opportunities, filtering to IICA Americas and actionable notices", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(IFAD_OPPORTUNITIES_HTML),
    });

    const result = await ifadOpportunitiesScraper.scrape();

    expect(result.sourceSlug).toBe("ifad-opportunities");
    expect(result.partialErrors).toHaveLength(0);
    expect(result.projects).toHaveLength(2);

    const urls = result.projects.map((project) => project.url);
    expect(urls).toContain(
      "https://www.ifad.org/en/project-procurement/opportunities?p_p_id=UNDB_PORTLET_INSTANCE_rhef&p_p_lifecycle=2&_UNDB_PORTLET_INSTANCE_rhef_db_ref_no=356"
    );
    expect(urls).toContain(
      "https://www.ifad.org/en/project-procurement/opportunities?p_p_id=UNDB_PORTLET_INSTANCE_bvwb&p_p_lifecycle=2&_UNDB_PORTLET_INSTANCE_bvwb_db_ref_no=328"
    );

    const honduras = result.projects.find((project) => project.region === "Honduras");
    expect(honduras).toBeDefined();
    expect(honduras?.opportunityType).toBe("Programa");
    expect(honduras?.deadline).toBeInstanceOf(Date);
    expect(honduras?.idioma).toBe("en");

    const ecuador = result.projects.find((project) => project.region === "Ecuador");
    expect(ecuador).toBeDefined();
    expect(ecuador?.opportunityType).toBe("Licitacion");
    expect(ecuador?.tags).toContain("IFAD");
  });

  it("returns partial error when IFAD page is unavailable", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });

    const result = await ifadOpportunitiesScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors[0]).toContain("HTTP 503");
  });

  it("falls back to UNGM IFAD notices when IFAD page is blocked by Cloudflare", async () => {
    (global.fetch as jest.Mock).mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "https://www.ifad.org/en/project-procurement/opportunities") {
        return Promise.resolve({ ok: false, status: 403 });
      }

      if (url === "https://www.ungm.org/Public/Notice/Search") {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(UNGM_IFAD_FALLBACK_HTML) });
      }

      return Promise.resolve({ ok: false, status: 404 });
    });

    const result = await ifadOpportunitiesScraper.scrape();

    expect(result.sourceSlug).toBe("ifad-opportunities");
    expect(result.projects).toHaveLength(1);
    expect(result.partialErrors[0]).toContain("HTTP 403");
    expect(result.partialErrors[0]).toContain("UNGM fallback");

    const first = result.projects[0];
    expect(first.institution).toBe("IFAD");
    expect(first.url).toBe("https://www.ungm.org/Public/Notice/301566");
    expect(first.region).toBe("Honduras");
    expect(first.opportunityType).toBe("Licitacion");
    expect(first.deadline).toBeInstanceOf(Date);
    expect(first.tags).toContain("IFAD");
    expect(first.tags).toContain("UNGM");
  });
});
