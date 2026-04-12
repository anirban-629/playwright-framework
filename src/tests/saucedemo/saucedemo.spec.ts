import { logger } from "../../../config/logging";
import { test } from "../../fixtures";

test.beforeEach(async ({ page }, testInfo) => {
	logger.testStart(testInfo.title);
	await page.goto("https://www.saucedemo.com/");
});

// biome-ignore lint/correctness/noEmptyPattern: <no page instance is required>
test.afterEach(async ({}, testInfo) => {
	logger.testEnd(testInfo.title, testInfo.status ? "PASSED" : "FAILED");
});

test.describe("Sauce Demo", { tag: "@saucedemo" }, async () => {
	test("sauce", async ({ sauceDemoPage }) => {
		await sauceDemoPage.SauceDemoTest();
	});
});
