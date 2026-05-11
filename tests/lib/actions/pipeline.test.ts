/**
 * @jest-environment node
 */

jest.mock("../../../lib/prisma", () => ({
  __esModule: true,
  default: {
    project: {
      count: jest.fn(),
    },
    source: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import { getPipelineMetrics } from "../../../lib/actions/pipeline";
const prisma = require("../../../lib/prisma").default;

describe("getPipelineMetrics", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns correct stats from Prisma queries", async () => {
    prisma.project.count
      .mockResolvedValueOnce(100)  // total
      .mockResolvedValueOnce(30)   // active
      .mockResolvedValueOnce(5);   // needsReview

    prisma.source.findFirst.mockResolvedValue({ lastRunAt: new Date("2026-05-10") });
    prisma.source.findMany.mockResolvedValue([
      { slug: "fia", name: "FIA", lastRunStatus: "success", projectsCount: 10 },
    ]);

    const stats = await getPipelineMetrics();

    expect(stats.total).toBe(100);
    expect(stats.active).toBe(30);
    expect(stats.needsReview).toBe(5);
    expect(prisma.project.count).toHaveBeenCalledTimes(3);
  });
});
