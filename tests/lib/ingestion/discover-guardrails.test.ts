import { passesGuardrails } from "@/scripts/discover-projects-lib";

jest.mock("@/lib/ingestion/validateUrl", () => ({
  validateUrl: jest.fn(),
}));
const { validateUrl } = require("@/lib/ingestion/validateUrl");

describe("passesGuardrails", () => {
  beforeEach(() => validateUrl.mockReset());

  const longSnippet =
    "este snippet textual tiene una cantidad de palabras suficiente para superar el umbral mínimo de quince palabras requerido por el guardrail";

  it("descarta si snippet < 15 palabras", async () => {
    const r = await passesGuardrails({
      url: "https://x.com/a", title: "T", source_snippet: "muy corto",
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("snippet");
  });

  it("descarta si snippet vacío", async () => {
    const r = await passesGuardrails({ url: "https://x.com/a", title: "T", source_snippet: "" });
    expect(r.ok).toBe(false);
  });

  it("descarta si URL no resuelve", async () => {
    validateUrl.mockResolvedValue({ ok: false, reason: "404" });
    const r = await passesGuardrails({
      url: "https://x.com/a", title: "T", source_snippet: longSnippet,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("404");
  });

  it("acepta cuando snippet >= 15 palabras y URL ok", async () => {
    validateUrl.mockResolvedValue({ ok: true });
    const r = await passesGuardrails({
      url: "https://x.com/a", title: "T", source_snippet: longSnippet,
    });
    expect(r.ok).toBe(true);
  });
});
