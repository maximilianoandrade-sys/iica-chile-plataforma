/**
 * @jest-environment node
 */

import fs from "node:fs";
import path from "node:path";

describe("workspace hygiene config", () => {
  it("excludes nested local workspace copy from TypeScript include", () => {
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8")) as {
      exclude?: string[];
    };

    expect(tsconfig.exclude ?? []).toEqual(
      expect.arrayContaining(["iica-chile-plataforma"]),
    );
  });

  it("excludes nested local workspace copy from Jest test discovery", () => {
    const jestConfigPath = path.join(process.cwd(), "jest.config.js");
    const jestConfigSource = fs.readFileSync(jestConfigPath, "utf8");

    expect(jestConfigSource).toContain("<rootDir>/iica-chile-plataforma/");
  });
});
