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
});
