import { createHmac } from "crypto";

// Mock Next.js modules before importing middleware
function mockHeaders() {
  const store = new Map<string, string>();
  return { set: (k: string, v: string) => store.set(k, v), get: (k: string) => store.get(k), entries: () => store.entries() };
}
const mockRedirect = jest.fn((..._args: any[]) => ({ type: "redirect", headers: mockHeaders() }));
const mockJson = jest.fn((..._args: any[]) => ({
  type: "json",
  body: _args[0],
  status: _args[1]?.status,
  headers: mockHeaders(),
}));
const mockNext = jest.fn((..._args: any[]) => ({ type: "next", headers: mockHeaders() }));

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: (...args: any[]) => mockRedirect(...args),
    json: (...args: any[]) => mockJson(...args),
    next: (...args: any[]) => mockNext(...args),
  },
}));

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

// Import middleware once (env is read at runtime, no need for resetModules)
import { middleware } from "../middleware";

describe("middleware admin token expiry", () => {
  beforeEach(() => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    mockRedirect.mockClear();
    mockJson.mockClear();
    mockNext.mockClear();
  });

  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("accepts a fresh token (< 8h old)", async () => {
    const now = Date.now();
    const token = generateToken(SECRET, now);
    const req = makeRequest("/admin/dashboard", token);

    await middleware(req as any);
    expect(mockNext).toHaveBeenCalled();
  });

  it("rejects an expired token (> 8h old)", async () => {
    const nineHoursAgo = Date.now() - 9 * 60 * 60 * 1000;
    const token = generateToken(SECRET, nineHoursAgo);
    const req = makeRequest("/admin/dashboard", token);

    await middleware(req as any);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalled();
  });

  it("rejects a tampered token", async () => {
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
    const req = makeRequest("/admin/dashboard", "abcdef1234567890".repeat(4));

    await middleware(req as any);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalled();
  });
});
