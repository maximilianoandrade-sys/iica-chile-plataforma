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
import { markStale } from "../../../lib/ingestion/persistence";
import { scrapers } from "../../../lib/ingestion/registry";
const { upsertProject } = require("../../../lib/ingestion/persistence");

describe("selectScrapers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (upsertProject as jest.Mock).mockResolvedValue({});
    (markStale as jest.Mock).mockResolvedValue({
      markedByLastSeen: 0,
      markedByDeadline: 0,
    });
  });

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

  it("passes failing source slug to markStale exclusions", async () => {
    const { main } = await import("../../../scripts/run-scrapers");

    (scrapers[0].scrape as jest.Mock).mockResolvedValue({
      sourceSlug: "fia",
      projects: [],
      partialErrors: ["fetch failed"],
    });

    const originalOnly = process.env.ONLY_SCRAPER;
    process.env.ONLY_SCRAPER = "fia";
    try {
      await main({ exitOnAllFailed: false });
    } finally {
      if (originalOnly === undefined) {
        delete process.env.ONLY_SCRAPER;
      } else {
        process.env.ONLY_SCRAPER = originalOnly;
      }
    }

    expect(markStale).toHaveBeenCalledWith({ skipSourceSlugs: ["fia"] });
  });

  it("counts duplicate merge skips as partial and protects critical source", async () => {
    const { main } = await import("../../../scripts/run-scrapers");

    (scrapers[0].scrape as jest.Mock).mockResolvedValue({
      sourceSlug: "fia",
      projects: [
        {
          url: "https://example.com/fia-dup",
          title: "FIA Duplicate",
          institution: "FIA",
        },
      ],
      partialErrors: [],
    });

    (upsertProject as jest.Mock).mockResolvedValue({ skipped: true, reason: 'duplicate_textual:55' });

    const originalOnly = process.env.ONLY_SCRAPER;
    process.env.ONLY_SCRAPER = "fia";
    try {
      await main({ exitOnAllFailed: false });
    } finally {
      if (originalOnly === undefined) {
        delete process.env.ONLY_SCRAPER;
      } else {
        process.env.ONLY_SCRAPER = originalOnly;
      }
    }

    expect(markStale).toHaveBeenCalledWith({ skipSourceSlugs: ["fia"] });
  });
});
