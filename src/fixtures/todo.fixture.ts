import { test } from "@playwright/test";
import { TodoPage } from "../pages/common";

type TestFixtures = {
	todoPage: TodoPage;
};

/**
 * @description Intiating a todoPage fixture
 */

export const todoPage = test.extend<TestFixtures>({
	todoPage: async ({ page }, use) => {
		const todoPage = new TodoPage(page);
		await use(todoPage);
	},
});
