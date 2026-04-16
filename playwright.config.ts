import { defineConfig, devices } from "@playwright/test";
import { config } from "./config/environments";
import { ortoniReportConfig } from "./config/report/ortoni.config";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./src/tests",
	timeout: config.TIMEOUT,
	/* Run tests in files in parallel */
	fullyParallel: config.PARALLEL,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	// forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: config.RETRY,
	/* Opt out of parallel tests on CI. */
	workers: config.WORKERS,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: [
		["line"],
		["html", { outputFolder: "playwright-report", open: "never" }],
		["ortoni-report", ortoniReportConfig],
		["allure-playwright"],
		[
			"./reporters/custom-reporter.ts",
			{
				outputFile: "./custom-report/client-report.html",
				title: "Login Test Report", // optional
			},
		],
	],
	expect: {
		timeout: config.EXPECT_TIMEOUT,
	},
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		launchOptions: {
			slowMo: config.IS_LOCAL ? 500 : undefined,
		},
		actionTimeout: config.ACTION_TIMEOUT,
		navigationTimeout: config.NAV_TIMEOUT,
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
			name: "setup db",
			testMatch: /global\.setup\.ts/,
			teardown: "cleanup db",
		},
		{
			name: "cleanup db",
			testMatch: /global\.teardown\.ts/,
		},
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
			dependencies: ["setup db"],
		},
	],
});
