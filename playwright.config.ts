import { defineConfig, devices } from "@playwright/test";
import { config } from "./config/environments";
import { ortoniReportConfig } from "./config/report/ortoni.config";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./src/tests",
	/* Run tests in files in parallel */
	fullyParallel: config.PARELLAL,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	// forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: config.RETRY,
	/* Opt out of parallel tests on CI. */
	workers: config.WORKERS,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		["line"],
		["html"],
		["ortoni-report", ortoniReportConfig],
		["allure-playwright"],
		["./reporters/custom-reporter.ts", {
			outputFile: "./custom-report/client-report.html",
			title: "Login Test Report",   // optional
		}],
	],
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		headless: config.HEADLESS,
		/* Base URL to use in actions like `await page.goto('')`. */
		baseURL: config.URL,
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		screenshot: "only-on-failure",
		// video: {
		//   mode: "on",
		//   size: { width: 640, height: 480 },
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
