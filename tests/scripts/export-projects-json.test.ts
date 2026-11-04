import fs from "node:fs";
import path from "node:path";

describe("catalog export pipeline", () => {
  const script = fs.readFileSync(
    path.join(process.cwd(), "scripts", "export-projects-json.ts"),
    "utf8",
  );
  const workflow = fs.readFileSync(
    path.join(process.cwd(), ".github", "workflows", "ingest-scrapers.yml"),
    "utf8",
  );

  it("writes projects and metadata through the shared catalog export", () => {
    expect(script).toContain("buildCatalogMetadata");
    expect(script).toContain("METADATA_FILE");
    expect(script).toContain("writeJsonAtomically");
  });

  it("runs the fallback export after ingestion", () => {
    expect(workflow).toContain("Export fallback catalog");
    expect(workflow).toContain("npx tsx scripts/export-projects-json.ts");
  });
});
