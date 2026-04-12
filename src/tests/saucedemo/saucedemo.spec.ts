import { logger } from "../../../config/logging";
import { test } from "../../fixtures";

// biome-ignore lint/correctness/noEmptyPattern: < >
test.beforeEach(async ({}, testInfo) => {
	logger.testStart(testInfo.title);
});

// biome-ignore lint/correctness/noEmptyPattern: <no page instance is required>
test.afterEach(async ({}, testInfo) => {
	logger.testEnd(testInfo.title, testInfo.status ? "PASSED" : "FAILED");
});

test.describe("Sauce Demo", { tag: "@saucedemo" }, async () => {
	test("sauce", async ({ sauceDemoPage, authPage }) => {
		// await sauceDemoPage.verifyLoginPage();
		await authPage.loginIfNeeded("standard_user");
		// await sauceDemoPage.loginAsStandardUser();
		await sauceDemoPage.verifyAllProducts();
	});
	test("sauce 1", async ({ sauceDemoPage, authPage }) => {
		// await sauceDemoPage.verifyLoginPage();
		await authPage.loginIfNeeded("visual_user");
		// await sauceDemoPage.loginAsStandardUser();
		await sauceDemoPage.verifyAllProducts();
	});
});
