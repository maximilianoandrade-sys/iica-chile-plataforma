/**
 * @jest-environment node
 */

const findManyMock = jest.fn();
const disconnectMock = jest.fn();

jest.mock("../../lib/prisma", () => ({
  __esModule: true,
  default: {
    source: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
    $disconnect: (...args: unknown[]) => disconnectMock(...args),
  },
}));

jest.mock("../../lib/utils/logger", () => ({
  getLogger: () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe("coverage-check script", () => {
  const originalArgv = process.argv;

  function buildCriticalSources(overrides: Partial<{ slug: string; projectsCount: number; lastRunStatus: string | null; lastRunAt: Date | null; }>[] = []) {
    const now = new Date();
    const base = [
      { slug: "fia", lastRunAt: now, projectsCount: 1, lastRunStatus: "success" },
      { slug: "fia-licitaciones", lastRunAt: now, projectsCount: 1, lastRunStatus: "success" },
      { slug: "corfo", lastRunAt: now, projectsCount: 1, lastRunStatus: "success" },
      { slug: "indap", lastRunAt: now, projectsCount: 1, lastRunStatus: "success" },
      { slug: "fontagro", lastRunAt: now, projectsCount: 1, lastRunStatus: "success" },
      { slug: "cnr", lastRunAt: now, projectsCount: 1, lastRunStatus: "success" },
    ];

    return base.map((source) => {
      const patch = overrides.find((o) => o.slug === source.slug);
      return patch ? { ...source, ...patch } : source;
    });
  }

  beforeAll(() => {
    process.argv = ["node", "jest"];
  });

  afterAll(() => {
    process.argv = originalArgv;
  });

  beforeEach(() => {
    jest.resetModules();
    findManyMock.mockReset();
    disconnectMock.mockReset();
    disconnectMock.mockResolvedValue(undefined);
  });

  it("falla cuando falta una fuente crítica", async () => {
    findManyMock.mockResolvedValue([
      { slug: "fia", lastRunAt: new Date(), projectsCount: 1, lastRunStatus: "success" },
      { slug: "corfo", lastRunAt: new Date(), projectsCount: 1, lastRunStatus: "success" },
      { slug: "indap", lastRunAt: new Date(), projectsCount: 1, lastRunStatus: "success" },
      { slug: "fontagro", lastRunAt: new Date(), projectsCount: 1, lastRunStatus: "success" },
      { slug: "cnr", lastRunAt: new Date(), projectsCount: 1, lastRunStatus: "success" },
      // missing fia-licitaciones
    ]);

    const { runCoverageCheck } = await import("../../scripts/coverage-check");
    await expect(runCoverageCheck()).rejects.toThrow(
      /source no sembrada/i,
    );
  });

  it("falla cuando una fuente crítica queda en partial con 0 proyectos", async () => {
    findManyMock.mockResolvedValue(
      buildCriticalSources([
        { slug: "fia", projectsCount: 0, lastRunStatus: "partial" },
      ]),
    );

    const { runCoverageCheck } = await import("../../scripts/coverage-check");
    await expect(runCoverageCheck()).rejects.toThrow(/fia: 0 proyectos con status partial/i);
  });

  it("no falla cuando una fuente crítica queda en partial pero con proyectos", async () => {
    findManyMock.mockResolvedValue(
      buildCriticalSources([
        { slug: "fia", projectsCount: 3, lastRunStatus: "partial" },
      ]),
    );

    const { runCoverageCheck } = await import("../../scripts/coverage-check");
    await expect(runCoverageCheck()).resolves.toBeUndefined();
  });

  it("falla cuando una fuente queda en success con 0 proyectos", async () => {
    findManyMock.mockResolvedValue(
      buildCriticalSources([
        { slug: "fia", projectsCount: 0, lastRunStatus: "success" },
      ]),
    );

    const { runCoverageCheck } = await import("../../scripts/coverage-check");
    await expect(runCoverageCheck()).rejects.toThrow(/fia: 0 proyectos con status success/i);
  });
});
