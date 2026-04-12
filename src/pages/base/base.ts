import fs from "node:fs";
import path from "node:path";
import { type Locator, type Page, test } from "@playwright/test";
import { logger } from "../../../config/logging";
import type { IScreenshotOptions } from "../../../types";

export abstract class BasePage {
	protected page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async navigate(url: string): Promise<void> {
		logger.step(`Navigating to: ${url}`);
		await this.page.goto(url);
	}

	async click(
		locator: Locator,
		elementName: string = "element",
	): Promise<void> {
		logger.step(`Clicking on: ${elementName}`);
		await locator.click();
	}

	async fill(
		locator: Locator,
		text: string,
		fieldName: string = "field",
	): Promise<void> {
		logger.step(`Filling '${fieldName}' with: ${text}`);
		await locator.fill(text);
	}

	async getText(locator: Locator): Promise<string> {
		const text = (await locator.textContent()) || "";
		logger.debug(`Retrieved text: ${text}`);
		return text;
	}

	async waitForElement(
		locator: Locator,
		elementName: string = "element",
	): Promise<void> {
		logger.step(`Waiting for: ${elementName}`);
		await locator.waitFor({ state: "visible" });
	}

	async waitForElementToBeHidden(
		locator: Locator,
		elementName: string = "element",
	): Promise<void> {
		logger.step(`Waiting for: ${elementName}`);

		await locator.waitFor({ state: "hidden" });
	}

	async getPageTitle(): Promise<string> {
		return await this.page.title();
	}

	async getCurrentUrl(): Promise<string> {
		return this.page.url();
	}

	async takeScreenshot(options: IScreenshotOptions = {}) {
		const { name = "screenshot", fullPage = true } = options;

		const testInfo = test.info();
		const safeTestName = testInfo.title.replace(/[^a-zA-Z0-9-_]/g, "_");

		const dir = path.join("test-results", "screenshots", safeTestName);

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}

		const filePath = path.join(dir, `${Date.now()}-${name}.png`);

		await this.page.screenshot({
			path: filePath,
			fullPage,
		});

		// Attach to Playwright (and Ortoni)
		await testInfo.attach(name, {
			path: filePath,
			contentType: "image/png",
		});

		return filePath;
	}

	// ? Element State & Assertions Helpers
	async isVisible(locator: Locator): Promise<boolean> {
		logger.step("Checking if element is visible");
		return await locator.isVisible();
	}

	async isHidden(locator: Locator): Promise<boolean> {
		logger.step("Checking if element is hidden");
		return await locator.isHidden();
	}

	async isEnabled(locator: Locator): Promise<boolean> {
		logger.step("Checking if element is enabled");
		return await locator.isEnabled();
	}

	async isDisabled(locator: Locator): Promise<boolean> {
		logger.step("Checking if element is disabled");
		return await locator.isDisabled();
	}

	async getAttribute(
		locator: Locator,
		attribute: string,
	): Promise<string | null> {
		return await locator.getAttribute(attribute);
	}

	// ? Text & Value Helpers
	async getInputValue(locator: Locator): Promise<string> {
		return await locator.inputValue();
	}

	async clearField(
		locator: Locator,
		fieldName: string = "field",
	): Promise<void> {
		logger.step(`Clearing ${fieldName}`);
		await locator.fill("");
	}

	async containsText(locator: Locator, expectedText: string): Promise<boolean> {
		const actualText = await this.getText(locator);
		return actualText.includes(expectedText);
	}

	// ? Dropdown & Select Helpers
	async selectByValue(
		locator: Locator,
		value: string,
		dropdownName: string = "dropdown",
	): Promise<void> {
		logger.step(`Selecting value '${value}' from ${dropdownName}`);
		await locator.selectOption(value);
	}

	async selectByLabel(
		locator: Locator,
		label: string,
		dropdownName: string = "dropdown",
	): Promise<void> {
		logger.step(`Selecting label '${label}' from ${dropdownName}`);
		await locator.selectOption({ label });
	}

	// ? Mouse & Keyboard Actions
	async hover(
		locator: Locator,
		elementName: string = "element",
	): Promise<void> {
		logger.step(`Hovering over: ${elementName}`);
		await locator.hover();
	}

	async pressKey(
		locator: Locator,
		key: string,
		elementName: string = "element",
	): Promise<void> {
		logger.step(`Pressing '${key}' on ${elementName}`);
		await locator.press(key);
	}

	// ? Scrolling Helpers

	async scrollIntoView(
		locator: Locator,
		elementName: string = "element",
	): Promise<void> {
		logger.step(`Scrolling to: ${elementName}`);
		await locator.scrollIntoViewIfNeeded();
	}

	async scrollToTop(): Promise<void> {
		await this.page.evaluate(() => window.scrollTo(0, 0));
	}

	async scrollToBottom(): Promise<void> {
		await this.page.evaluate(() =>
			window.scrollTo(0, document.body.scrollHeight),
		);
	}

	// ? Page / Navigation Helpers
	async reloadPage(): Promise<void> {
		logger.step("Reloading page");
		await this.page.reload();
	}

	async goBack(): Promise<void> {
		logger.step("Navigating back");
		await this.page.goBack();
	}

	async goForward(): Promise<void> {
		logger.step("Navigating forward");
		await this.page.goForward();
	}

	// ? Wait Helpers (Non-Element)
	async waitForUrl(urlPart: string, timeout: number = 10000): Promise<void> {
		logger.step(`Waiting for URL to contain: ${urlPart}`);
		await this.page.waitForURL(`**${urlPart}**`, { timeout });
	}

	async waitForNetworkIdle(): Promise<void> {
		await this.page.waitForLoadState("networkidle");
	}

	// ? Cookie & Storage Helpers
	async clearCookies(): Promise<void> {
		await this.page.context().clearCookies();
	}

	async clearLocalStorage(): Promise<void> {
		await this.page.evaluate(() => localStorage.clear());
	}

	async clearSessionStorage(): Promise<void> {
		await this.page.evaluate(() => sessionStorage.clear());
	}

	// ? Utility Helpers
	async getElementCount(locator: Locator): Promise<number> {
		return await locator.count();
	}

	async wait(ms: number, reason: string = "explicit wait"): Promise<void> {
		logger.step(`Waiting ${ms}ms (${reason})`);
		await this.page.waitForTimeout(ms);
	}
}
