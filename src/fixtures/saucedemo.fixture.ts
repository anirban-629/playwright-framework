import { test } from "@playwright/test";
import { SauceDemoPage } from "../pages/common";

type TestFixtures = {
	sauceDemoPage: SauceDemoPage;
};

/**
 * @description Intiating a sauce demo fixture
 */

export const sauceDemoPage = test.extend<TestFixtures>({
	sauceDemoPage: async ({ page }, use) => {
		const sauceDemoPage = new SauceDemoPage(page);
		await use(sauceDemoPage);
	},
});
