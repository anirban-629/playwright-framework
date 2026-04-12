import { test as base } from "@playwright/test";
import { AuthPage } from "../pages/common";

// ── Fixture types ────────────────────────────────────────────────────────────
type TestFixtures = {
	authPage: AuthPage;
};

// ── Extend base test with auth fixtures ──────────────────────────────────────
export const authPage = base.extend<TestFixtures>({
	authPage: async ({ page, context }, use) => {
		const loginPage = new AuthPage(page, context, "https://www.saucedemo.com");
		await use(loginPage);
	},
});
