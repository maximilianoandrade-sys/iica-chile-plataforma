import { validateUrl } from "../../../lib/ingestion/validateUrl";

global.fetch = jest.fn();

describe("validateUrl", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
  });

  it("ok cuando 200", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, url: "https://example.com/x",
    });
    expect(await validateUrl("https://example.com/x")).toEqual({ ok: true });
  });

  it("falla con 404", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 404, url: "https://example.com/x",
    });
    const r = await validateUrl("https://example.com/x");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("404");
  });

  it("falla con 5xx", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false, status: 503, url: "https://example.com/x",
    });
    const r = await validateUrl("https://example.com/x");
    expect(r.ok).toBe(false);
  });

  it("detecta redirect a homepage", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, url: "https://example.com/",
    });
    const r = await validateUrl("https://example.com/convocatoria/abc");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("homepage");
  });

  it("acepta redirect dentro del mismo path", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, status: 200, url: "https://example.com/convocatoria/abc-2026",
    });
    const r = await validateUrl("https://example.com/convocatoria/abc");
    expect(r.ok).toBe(true);
  });

  it("falla con URL vacía", async () => {
    expect((await validateUrl("")).ok).toBe(false);
  });

  it("rechaza URL que es solo el dominio raíz (sin deep link)", async () => {
    const r = await validateUrl("https://www.fia.cl/");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("homepage");
    // No debería haber tocado fetch — el check es previo
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rechaza URL sin path después del dominio", async () => {
    const r = await validateUrl("https://www.fia.cl");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("homepage");
  });

  it("captura errores de red", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ETIMEDOUT"));
    const r = await validateUrl("https://example.com/x");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("ETIMEDOUT");
  });

  it("acepta 403 para deep links de Devex (anti-bot protegido)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      url: "https://www.devex.com/funding/r?report=tender-877050",
    });

    const r = await validateUrl("https://www.devex.com/funding/r?report=tender-877050");
    expect(r).toEqual({ ok: true });
  });
});
