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

  it("captura errores de red", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("ETIMEDOUT"));
    const r = await validateUrl("https://example.com/x");
    expect(r.ok).toBe(false);
    expect(r.reason).toContain("ETIMEDOUT");
  });
});
