/**
 * @jest-environment node
 */
import { corfoScraper } from "../../../../lib/ingestion/scrapers/corfo";

global.fetch = jest.fn();

describe("corfoScraper", () => {
  it("parsea HTML con programas CORFO", async () => {
    const listingHtml = `<html><body>
      <div class="cuadro-completo_fase2">
        <span class="cuerpo-titulo_fase2">Innova CORFO 2026</span>
        <span class="cuerpo-titulo_fase2-subtitulo">Alcance: Todo Chile</span>
        <div class="box-cierre"><p>28/05/2026</p></div>
        <div class="cuerpo-texto_fase2">Innovación empresarial</div>
        <div class="cuadro-completo_fase2-info"><a href="/sites/cpp/convocatoria-innova">Más información</a></div>
      </div>
      <div class="cuadro-completo_fase2">
        <span class="cuerpo-titulo_fase2">Startup Ciencia</span>
        <span class="cuerpo-titulo_fase2-subtitulo">Alcance: Nacional</span>
        <div class="box-cierre"><p>15/06/2026</p></div>
        <div class="cuerpo-texto_fase2">Base científica</div>
        <div class="cuadro-completo_fase2-info"><a href="/sites/cpp/startup-ciencia">Más información</a></div>
      </div>
    </body></html>`;

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(listingHtml) })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("<p>hasta $150.000.000.-</p>") })
      .mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("<p>hasta $300.000.000.-</p>") });

    const result = await corfoScraper.scrape();

    expect(result.sourceSlug).toBe("corfo");
    expect(result.projects.length).toBe(2);
    expect(result.projects[0].institution).toBe("CORFO");
    expect(result.projects[0].url).toContain("corfo.gob.cl");
    expect(result.projects[0].budget).toBe("Hasta $150M");
  });
});
