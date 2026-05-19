import { createHmac } from "crypto";

// Mock Next.js modules before importing middleware
const mockRedirect = jest.fn(() => ({ type: "redirect" }));
const mockJson = jest.fn((body: unknown, init?: { status?: number }) => ({
  type: "json",
  body,
  status: init?.status,
}));
const mockNext = jest.fn(() => ({ type: "next" }));

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: (...args: unknown[]) => mockRedirect(...args),
    json: (...args: unknown[]) => mockJson(...args),
    next: (...args: unknown[]) => mockNext(...args),
  },
}));

// We need to test the logic directly since middleware uses crypto.subtle
// which isn't available in Node test env. We'll mock crypto.subtle.

const SECRET = "test-secret";

function generateToken(secret: string, timestampMs: number): string {
  const sig = createHmac("sha256", secret)
    .update(`admin-session:${timestampMs}`)
    .digest("hex");
  return `${sig}.${timestampMs}`;
}

function makeRequest(path: string, cookie?: string) {
  return {
    nextUrl: { pathname: path },
    url: "http://localhost:3000" + path,
    cookies: {
      get: (name: string) =>
        name === "admin-token" && cookie ? { value: cookie } : undefined,
    },
  };
}

// Mock crypto.subtle for Edge Runtime simulation
const originalCrypto = global.crypto;

beforeAll(() => {
  const { webcrypto } = require("crypto");
  Object.defineProperty(global, "crypto", {
    value: webcrypto,
    writable: true,
  });
});

afterAll(() => {
  Object.defineProperty(global, "crypto", {
    value: originalCrypto,
    writable: true,
  });
});

describe("middleware admin token expiry", () => {
  let middleware: (req: unknown) => Promise<unknown>;

  beforeEach(() => {
    jest.resetModules();
    process.env.ADMIN_SESSION_SECRET = SECRET;
    mockRedirect.mockClear();
    mockJson.mockClear();
    mockNext.mockClear();
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  async function loadMiddleware() {
    const mod = await import("../middleware");
    return mod.middleware;
  }

  it("accepts a fresh token (< 8h old)", async () => {
    middleware = await loadMiddleware();
    const now = Date.now();
    const token = generateToken(SECRET, now);
    const req = makeRequest("/admin/dashboard", token);

    await middleware(req as any);
    expect(mockNext).toHaveBeenCalled();
  });

  it("rejects an expired token (> 8h old)", async () => {
    middleware = await loadMiddleware();
    const nineHoursAgo = Date.now() - 9 * 60 * 60 * 1000;
    const token = generateToken(SECRET, nineHoursAgo);
    const req = makeRequest("/admin/dashboard", token);

    await middleware(req as any);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalled();
  });

  it("rejects a tampered token", async () => {
    middleware = await loadMiddleware();
    const now = Date.now();
    const token = generateToken(SECRET, now);
    // Tamper with the signature
    const tampered = "a" + token.substring(1);
    const req = makeRequest("/admin/dashboard", tampered);

    await middleware(req as any);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalled();
  });

  it("rejects token without dot separator (old format)", async () => {
    middleware = await loadMiddleware();
    const req = makeRequest("/admin/dashboard", "abcdef1234567890".repeat(4));

    await middleware(req as any);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalled();
  });
});
