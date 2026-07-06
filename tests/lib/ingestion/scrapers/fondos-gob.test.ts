/**
 * @jest-environment node
 */
import { fondosGobScraper } from "../../../../lib/ingestion/scrapers/fondos-gob";

global.fetch = jest.fn();

// Real HTML structure from fondos.gob.cl (simplified)
const CARD_AGRO = `
<div class="col-md-6 col-lg-3">
  <a href="/ficha/minagri/fondo-riego-campesino-2026/">
    <div class="card mb-4">
      <div class="titular p-3">
        <div class="mb-2 d-flex justify-content-between">
          <span class="badge bg-green rounded-pill"> ABIERTO</span>
          <span class="text-white"><i class="bi bi-geo-alt me-1"></i>Nacional</span>
        </div>
        <div class="mb-4 d-block text-white">
          <small class="text-uppercase text-rosa">Ministerio de Agricultura</small>
          <h6 class="mt-1">Fondo de Riego Campesino para Pequeños Agricultores 2026</h6>
        </div>
      </div>
      <div class="card-body pt-0">
        <div class="mb-4 d-block text-dark">
          <span class="text-bold"><b><i class="me-1 bi bi-people text-dark"></i> Beneficiarios/as: </b></span>
          <p>Personas Naturales</p>
          <span class="text-bold"><b><i class="me-1 bi bi-calendar-week text-dark"></i> Fechas: </b></span>
          <p>Inicio: 01/06/2026 <span class="text-bold text-primary">|</span> Fin: 30/08/2026</p>
          <span class="text-bold"><b><i class="me-1 bi bi-cash-coin text-dark"></i> Montos: </b></span>
          <p>Hasta $6.000.000</p>
        </div>
      </div>
    </div>
  </a>
</div>`;

const CARD_IRRELEVANT = `
<div class="col-md-6 col-lg-3">
  <a href="/ficha/mincap/fm_luisadvis2026/">
    <div class="card mb-4">
      <div class="titular p-3">
        <div class="mb-2 d-flex justify-content-between">
          <span class="badge bg-green rounded-pill"> ABIERTO</span>
          <span class="text-white"><i class="bi bi-geo-alt me-1"></i>Nacional</span>
        </div>
        <div class="mb-4 d-block text-white">
          <small class="text-uppercase text-rosa">Ministerio de las Culturas, las Artes y el Patrimonio</small>
          <h6 class="mt-1">Fondo de la Música: Concurso de Composición Musical Luis Advis 2026</h6>
        </div>
      </div>
      <div class="card-body pt-0">
        <div class="mb-4 d-block text-dark">
          <span class="text-bold"><b><i class="me-1 bi bi-calendar-week text-dark"></i> Fechas: </b></span>
          <p>Inicio: 08/05/2026 <span class="text-bold text-primary">|</span> Fin: 05/08/2026</p>
          <span class="text-bold"><b><i class="me-1 bi bi-cash-coin text-dark"></i> Montos: </b></span>
          <p>Entre $1.000.000 hasta $6.000.000</p>
        </div>
      </div>
    </div>
  </a>
</div>`;

const CARD_CLOSED = `
<div class="col-md-6 col-lg-3">
  <a href="/ficha/cnr/concurso-riego-cerrado/">
    <div class="card mb-4">
      <div class="titular p-3">
        <div class="mb-2 d-flex justify-content-between">
          <span class="badge bg-secondary rounded-pill"> CERRADO</span>
          <span class="text-white"><i class="bi bi-geo-alt me-1"></i>Nacional</span>
        </div>
        <div class="mb-4 d-block text-white">
          <small class="text-uppercase text-rosa">Comisión Nacional Del Riego - CNR</small>
          <h6 class="mt-1">Concurso Riego Ley 18.450 Obras Menores</h6>
        </div>
      </div>
      <div class="card-body pt-0">
        <div class="mb-4 d-block text-dark">
          <span class="text-bold"><b><i class="me-1 bi bi-calendar-week text-dark"></i> Fechas: </b></span>
          <p>Inicio: 01/01/2026 <span class="text-bold text-primary">|</span> Fin: 01/03/2026</p>
        </div>
      </div>
    </div>
  </a>
</div>`;

const CARD_REGIONAL = `
<div class="col-md-6 col-lg-3">
  <a href="/ficha/goremaule/fndr-agricola-maule-2026/">
    <div class="card mb-4">
      <div class="titular p-3">
        <div class="mb-2 d-flex justify-content-between">
          <span class="badge bg-green rounded-pill"> ABIERTO</span>
          <span class="text-white"><i class="bi bi-geo-alt me-1"></i>Regional</span>
        </div>
        <div class="mb-4 d-block text-white">
          <small class="text-uppercase text-rosa">Gobierno Regional de Maule</small>
          <h6 class="mt-1">FNDR 8% Desarrollo Agrícola Sustentable Maule 2026</h6>
        </div>
      </div>
      <div class="card-body pt-0">
        <div class="mb-4 d-block text-dark">
          <span class="text-bold"><b><i class="me-1 bi bi-calendar-week text-dark"></i> Fechas: </b></span>
          <p>Inicio: 15/05/2026 <span class="text-bold text-primary">|</span> Fin: 15/09/2026</p>
          <span class="text-bold"><b><i class="me-1 bi bi-cash-coin text-dark"></i> Montos: </b></span>
          <p>Hasta $10.000.000</p>
        </div>
      </div>
    </div>
  </a>
</div>`;

function makePage(cards: string) {
  return `<html><body><section><div class="container"><div class="row grilla">${cards}</div></div></section></body></html>`;
}

function mockFetchOk(html: string) {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(html),
  });
}

afterEach(() => jest.restoreAllMocks());

describe("fondosGobScraper", () => {
  it("parses an agro-relevant open fund", async () => {
    mockFetchOk(makePage(CARD_AGRO));
    const result = await fondosGobScraper.scrape();
    expect(result.sourceSlug).toBe("fondos-gob");
    expect(result.projects).toHaveLength(1);
    const p = result.projects[0];
    expect(p.title).toContain("Fondo de Riego Campesino");
    expect(p.institution).toBe("Ministerio de Agricultura");
    expect(p.deadline).toBeInstanceOf(Date);
    expect(p.url).toContain("fondos.gob.cl/ficha/");
    expect(p.ambito).toBe("Nacional");
    expect(p.budget).toContain("6.000.000");
  });

  it("filters out non-agro funds (music/arts)", async () => {
    mockFetchOk(makePage(CARD_IRRELEVANT));
    const result = await fondosGobScraper.scrape();
    expect(result.projects).toHaveLength(0);
  });

  it("excludes closed funds", async () => {
    mockFetchOk(makePage(CARD_CLOSED));
    const result = await fondosGobScraper.scrape();
    expect(result.projects).toHaveLength(0);
  });

  it("maps regional funds correctly", async () => {
    mockFetchOk(makePage(CARD_REGIONAL));
    const result = await fondosGobScraper.scrape();
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].ambito).toBe("Regional");
  });

  it("handles mixed cards (keeps only relevant open ones)", async () => {
    mockFetchOk(makePage(CARD_AGRO + CARD_IRRELEVANT + CARD_CLOSED + CARD_REGIONAL));
    const result = await fondosGobScraper.scrape();
    expect(result.projects).toHaveLength(2);
  });

  it("returns partialErrors on HTTP failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 503 });
    const result = await fondosGobScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors.length).toBeGreaterThan(0);
  });

  it("handles empty page gracefully", async () => {
    mockFetchOk("<html><body></body></html>");
    const result = await fondosGobScraper.scrape();
    expect(result.projects).toHaveLength(0);
    expect(result.partialErrors).toContain(
      "No matching cards found — fondos.gob.cl structure may have changed"
    );
  });
});
