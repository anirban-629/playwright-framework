import { test as base, expect } from "@playwright/test";
import { TodoPage } from "../pages/common/TodoPage";

type TestFixtures = {
	todoPage: TodoPage
};

const test = base.extend<TestFixtures>({
	todoPage: async ({ page }, use) => {
		const todoPage = new TodoPage(page);
		await use(todoPage);
	}
});

export {
	test, expect
}