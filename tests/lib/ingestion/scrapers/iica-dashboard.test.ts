import { COUNTERPARTS_IICA_CHILE, getByCategory, TOTAL_COUNTERPARTS } from "../../../../lib/ingestion/counterparts-iica";

describe("IICA Dashboard - counterparts-iica", () => {
  it("has the expected total of counterparts", () => {
    expect(TOTAL_COUNTERPARTS).toBeGreaterThanOrEqual(70);
    expect(TOTAL_COUNTERPARTS).toBeLessThanOrEqual(80);
    expect(COUNTERPARTS_IICA_CHILE.length).toBe(TOTAL_COUNTERPARTS);
  });

  it("all counterparts have required fields", () => {
    for (const cp of COUNTERPARTS_IICA_CHILE) {
      expect(cp.id).toBeTruthy();
      expect(cp.name).toBeTruthy();
      expect(cp.abbrev).toBeTruthy();
      expect(cp.category).toBeTruthy();
      expect(typeof cp.id).toBe("string");
      expect(cp.id).toMatch(/^\d+$/); // numeric string
    }
  });

  it("has no duplicate IDs", () => {
    const ids = COUNTERPARTS_IICA_CHILE.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("has no duplicate abbreviations", () => {
    const abbrevs = COUNTERPARTS_IICA_CHILE.map(c => c.abbrev);
    const unique = new Set(abbrevs);
    expect(unique.size).toBe(abbrevs.length);
  });

  it("getByCategory returns correct subset", () => {
    const chilean = getByCategory("chilean");
    expect(chilean.length).toBeGreaterThan(10);
    expect(chilean.every(c => c.category === "chilean")).toBe(true);

    const research = getByCategory("research");
    expect(research.length).toBeGreaterThan(5);
    expect(research.every(c => c.category === "research")).toBe(true);
  });

  it("includes key Chilean institutions", () => {
    const ids = COUNTERPARTS_IICA_CHILE.map(c => c.id);
    expect(ids).toContain("179"); // FIA
    expect(ids).toContain("230"); // INDAP
    expect(ids).toContain("183"); // INIA
    expect(ids).toContain("252"); // MINAGRI
  });

  it("includes key international organizations", () => {
    const ids = COUNTERPARTS_IICA_CHILE.map(c => c.id);
    expect(ids).toContain("33"); // FAO
    expect(ids).toContain("7");  // IDB
    expect(ids).toContain("37"); // GEF
    expect(ids).toContain("97"); // GIZ
  });
});
