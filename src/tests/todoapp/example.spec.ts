import { logger } from "../../../config/logging";
import { TODO_ITEMS } from "../../constants";
import { expect, test } from "../../fixtures";

test.beforeEach(async ({ page }, testInfo) => {
	logger.testStart(testInfo.title);
	await page.goto("");
});

// biome-ignore lint/correctness/noEmptyPattern: <no page instance is required>
test.afterEach(async ({}, testInfo) => {
	logger.testEnd(testInfo.title, testInfo.status ? "PASSED" : "FAILED");
});

test.describe("New Todo", { tag: "@exampletodo" }, () => {
	test("should allow me to add todo items", async ({ page, todoPage }) => {
		// Create 1st todo.
		await page.locator(".new-todo").fill(TODO_ITEMS[0]);
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		await page.locator(".new-todo").press("Enter");

		// Make sure the list only has one todo item.
		await expect(page.locator(".view label")).toHaveText([TODO_ITEMS[0]]);
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		// Create 2nd todo.
		await page.locator(".new-todo").fill(TODO_ITEMS[1]);
		await page.locator(".new-todo").press("Enter");
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		// Make sure the list now has two todo items.
		await expect(page.locator(".view label")).toHaveText([
			TODO_ITEMS[0],
			TODO_ITEMS[1],
		]);
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		await todoPage.checkNumberOfTodosInLocalStorage(2);
	});

	test("should clear text input field when an item is added", async ({
		page,
		todoPage,
	}) => {
		// Create one todo item.
		await page.locator(".new-todo").fill(TODO_ITEMS[0]);
		await page.locator(".new-todo").press("Enter");
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		// Check that input is empty.
		await expect(page.locator(".new-todo")).toBeEmpty();
		await todoPage.checkNumberOfTodosInLocalStorage(1);
	});

	test("should append new items to the bottom of the list", async ({
		page,
		todoPage,
	}) => {
		// Create 3 items.
		await todoPage.createDefaultTodos();
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		// Check test using different methods.
		await expect(page.locator(".todo-count")).toHaveText("3 items left");
		await expect(page.locator(".todo-count")).toContainText("3");
		await expect(page.locator(".todo-count")).toHaveText(/3/);
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		// Check all items in one call.
		await expect(page.locator(".view label")).toHaveText(TODO_ITEMS);
		await todoPage.checkNumberOfTodosInLocalStorage(3);
	});

	test("should show #main and #footer when items added", async ({
		page,
		todoPage,
	}) => {
		await page.locator(".new-todo").fill(TODO_ITEMS[0]);
		await page.locator(".new-todo").press("Enter");
		await todoPage.takeScreenshot({
			fullPage: true,
		});
		await expect(page.locator(".main")).toBeVisible();
		await expect(page.locator(".footer")).toBeVisible();
		await todoPage.checkNumberOfTodosInLocalStorage(1);
	});
});
