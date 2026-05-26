import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config para tests E2E.
 *
 * Run local:
 *   npx playwright install chromium   # primera vez
 *   npm run dev                       # en otra terminal
 *   npm run e2e
 *
 * Run en CI:
 *   npx playwright install --with-deps chromium
 *   npm run build && npm run start &
 *   npm run e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Auto-start production server cuando no hay PLAYWRIGHT_BASE_URL externo.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 240_000,
      },
});
