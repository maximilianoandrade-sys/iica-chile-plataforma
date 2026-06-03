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
});
