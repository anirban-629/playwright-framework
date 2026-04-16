/* eslint-disable playwright/expect-expect */
import { test } from "../../fixtures";

test.describe("Sauce Demo", { tag: "@saucedemo" }, () => {
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
