/**
 * @jest-environment node
 */

jest.mock("../../../lib/ingestion/registry", () => ({
  scrapers: [
    {
      slug: "fia",
      name: "FIA",
      homepageUrl: "https://example.com/fia",
      scrape: jest.fn(),
    },
    {
      slug: "corfo",
      name: "CORFO",
      homepageUrl: "https://example.com/corfo",
      scrape: jest.fn(),
    },
  ],
}));

jest.mock("../../../lib/ingestion/persistence", () => ({
  upsertProject: jest.fn(),
  markStale: jest.fn(),
  updateSourceStatus: jest.fn(),
}));

jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
  },
}));

const originalArgv = process.argv;
process.argv = ["node", "jest"]; // evita auto-ejecución al importar

import { selectScrapers } from "../../../scripts/run-scrapers";

describe("selectScrapers", () => {
  afterAll(() => {
    process.argv = originalArgv;
  });

  it("retorna todos si ONLY_SCRAPER no está definido", () => {
    const result = selectScrapers(undefined);
    expect(result).toHaveLength(2);
  });

  it("filtra por slug ignorando mayúsculas", () => {
    const result = selectScrapers("FIA");
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("fia");
  });

  it("retorna vacío para slug inexistente", () => {
    const result = selectScrapers("does-not-exist");
    expect(result).toHaveLength(0);
  });
});
