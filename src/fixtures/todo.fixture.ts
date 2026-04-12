import { test } from "@playwright/test";
import { TodoPage } from "../pages/common/TodoPage";

type TestFixtures = {
	todoPage: TodoPage;
};

/**
 * @description Intiating a todoPage fixture
 */

export const todoPage = test.extend<TestFixtures>({
	todoPage: async ({ context }, use) => {
		const page = await context.newPage();
		const todoPage = new TodoPage(page);
		await use(todoPage);
	},
});
