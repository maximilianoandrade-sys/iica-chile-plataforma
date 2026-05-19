/**
 * @jest-environment node
 */

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: "Respuesta sobre fondos agrícolas",
        candidates: [
          {
            groundingMetadata: {
              groundingChunks: [
                { web: { uri: "https://example.com/source1" } },
                { web: { uri: "https://example.com/source2" } },
              ],
            },
          },
        ],
      }),
    },
  })),
}));

import { POST, GET } from "@/app/api/ai-search/route";
import { NextRequest } from "next/server";

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/ai-search", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/ai-search", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, GEMINI_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("GET returns route description", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json.route).toBe("/api/ai-search");
  });

  it("POST with valid query returns answer and sources", async () => {
    const res = await POST(makeRequest({ query: "fondos INDAP" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.answer).toBe("Respuesta sobre fondos agrícolas");
    expect(json.sources).toHaveLength(2);
    expect(json.searchedAt).toBeDefined();
  });

  it("POST with missing query returns 400", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("POST with empty query returns 400", async () => {
    const res = await POST(makeRequest({ query: "   " }));
    expect(res.status).toBe(400);
  });

  it("POST without GEMINI_API_KEY returns 503", async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await POST(makeRequest({ query: "test" }));
    expect(res.status).toBe(503);
  });
});
