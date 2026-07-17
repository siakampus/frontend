import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

/**
 * Playwright Configuration — SIAUGN Black Box Testing
 * Covers all scenarios from Tables 3.4.15 – 3.4.20
 */
export default defineConfig({
  testDir: "./tests",

  /* Run tests in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests once */
  retries: 1,

  /* Reporter */
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],

  use: {
    /* Base URL — from .env or Vite dev server fallback */
    baseURL: process.env.BASE_URL,

    /* Bypass ngrok browser warning */
    extraHTTPHeaders: {
      "ngrok-skip-browser-warning": "true",
    },

    /* Collect trace for failed tests */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video on failure */
    video: "on-first-retry",

    /* Browser viewport */
    viewport: { width: 1280, height: 720 },

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Timeout per test */
  timeout: 30000,

  /* Global test timeout */
  globalTimeout: 300000,
});
