import { TODO_ITEMS } from "../../constants";
import { BasePage } from "../base/base";

export class TodoPage extends BasePage {
	createDefaultTodos = async () => {
		for (const item of TODO_ITEMS) {
			await this.page.locator(".new-todo").fill(item);
			await this.page.locator(".new-todo").press("Enter");
		}
	};

	checkNumberOfTodosInLocalStorage = async (expected: number) => {
		return await this.page.waitForFunction((e) => {
			return JSON.parse(localStorage["react-todos"]).length === e;
		}, expected);
	};

	checkNumberOfCompletedTodosInLocalStorage = async (expected: number) => {
		return await this.page.waitForFunction((e) => {
			return (
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				JSON.parse(localStorage["react-todos"]).filter((i: any) => i.completed)
					.length === e
			);
		}, expected);
	};

	checkTodosInLocalStorage = async (title: string) => {
		return await this.page.waitForFunction((t) => {
			return (
				JSON.parse(localStorage["react-todos"])
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.map((i: any) => i.title)
					.includes(t)
			);
		}, title);
	};
}
