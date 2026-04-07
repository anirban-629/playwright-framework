import path from "node:path";

import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, ".env") });

import { ortoniReportConfig } from "./config/report/ortoni.config";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./src/tests",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	// forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	// retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	// workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [["ortoni-report", ortoniReportConfig], ["line"], ["html"]],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		headless: false,
		/* Base URL to use in actions like `await page.goto('')`. */
		baseURL: "https://demo.playwright.dev/todomvc",
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		screenshot: "only-on-failure",
		// video: {
		// 	mode: "on",
		// 	size: { width: 640, height: 480 },
		// },
	},
	/* Configure projects for major browsers */
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
