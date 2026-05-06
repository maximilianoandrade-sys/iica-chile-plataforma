import { normalizeUrl, parseSpanishDate, parseAmount, cleanText, absoluteUrl } from "@/lib/ingestion/utils";

describe("normalizeUrl", () => {
  it("baja a minúsculas", () => {
    expect(normalizeUrl("https://Example.COM/Path")).toBe("https://example.com/path");
  });
  it("quita trailing slash excepto en raíz", () => {
    expect(normalizeUrl("https://example.com/path/")).toBe("https://example.com/path");
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
  });
  it("quita params utm_*", () => {
    expect(normalizeUrl("https://example.com/x?utm_source=abc&id=1")).toBe("https://example.com/x?id=1");
  });
  it("quita fragmento", () => {
    expect(normalizeUrl("https://example.com/x#section")).toBe("https://example.com/x");
  });
  it("devuelve null para inputs inválidos", () => {
    expect(normalizeUrl("")).toBeNull();
    expect(normalizeUrl("not a url")).toBeNull();
  });
});

describe("parseSpanishDate", () => {
  it("DD-MM-YYYY", () => {
    expect(parseSpanishDate("31-03-2026")?.toISOString().slice(0, 10)).toBe("2026-03-31");
  });
  it("DD/MM/YYYY", () => {
    expect(parseSpanishDate("31/03/2026")?.toISOString().slice(0, 10)).toBe("2026-03-31");
  });
  it("'31 de marzo de 2026'", () => {
    expect(parseSpanishDate("31 de marzo de 2026")?.toISOString().slice(0, 10)).toBe("2026-03-31");
  });
  it("devuelve null si no parsea", () => {
    expect(parseSpanishDate("foo")).toBeNull();
    expect(parseSpanishDate("")).toBeNull();
  });
});

describe("parseAmount", () => {
  it("$10.000.000 CLP", () => {
    expect(parseAmount("$10.000.000 CLP")).toBe(10_000_000);
  });
  it("USD 250,000", () => {
    expect(parseAmount("USD 250,000")).toBe(250_000);
  });
  it("devuelve null si no parsea", () => {
    expect(parseAmount("ver bases")).toBeNull();
    expect(parseAmount("")).toBeNull();
  });
});

describe("cleanText", () => {
  it("colapsa espacios y trim", () => {
    expect(cleanText("  hola   mundo  ")).toBe("hola mundo");
  });
  it("normaliza saltos de línea", () => {
    expect(cleanText("a\n\nb\n\n\nc")).toBe("a b c");
  });
});

describe("absoluteUrl", () => {
  it("relativa con base", () => {
    expect(absoluteUrl("/x", "https://a.com/b/")).toBe("https://a.com/x");
  });
  it("absoluta se conserva", () => {
    expect(absoluteUrl("https://b.com/y", "https://a.com/")).toBe("https://b.com/y");
  });
});
