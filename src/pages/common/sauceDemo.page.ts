// biome-ignore assist/source/organizeImports: <IMPORT SORING ERROR>
import { expect } from "@playwright/test";
import { BasePage } from "../base/base";
import { SAUCE_DEMO_PRODUCTS } from "../../constants";
import { logger } from "../../../config/logging";

export class SauceDemoPage extends BasePage {
	async verifyLoginPage() {
		await expect(this.page.getByText("Swag Labs")).toBeVisible();
		await expect(this.page.locator('[data-test="username"]')).toBeVisible();
		await expect(this.page.locator('[data-test="password"]')).toBeVisible();
		await expect(this.page.locator('[data-test="login-button"]')).toBeVisible();
		await expect(
			this.page
				.locator("div")
				.filter({ hasText: "Accepted usernames are:" })
				.nth(4),
		).toBeVisible();
	}

	async loginAsStandardUser() {
		await this.page.locator('[data-test="username"]').click();
		await this.page.locator('[data-test="username"]').fill("standard_user");
		await this.page.locator('[data-test="password"]').click();
		await this.page.locator('[data-test="password"]').fill("secret_sauce");
		await this.page.locator('[data-test="login-button"]').click();
		await expect(this.page.getByText("Swag Labs")).toBeVisible();
		await expect(this.page.locator('[data-test="title"]')).toBeVisible();
	}
	async verifyAllProducts() {
		const noOfProducts = await this.page
			.locator('[data-test="inventory-item"]')
			.count();
		expect(noOfProducts === SAUCE_DEMO_PRODUCTS.length, "Count didn't match");

		for (let i = 0; i < noOfProducts; i++) {
			const { imgId, price, title } = SAUCE_DEMO_PRODUCTS[i];
			await expect(
				this.page.locator('[data-test="inventory-item"]').nth(i),
			).toBeVisible();
			expect(
				this.page.locator('[data-test="inventory-item-name"]').nth(i),
			).toHaveText(title);
			expect(
				this.page.locator('[data-test="inventory-item-price"]').nth(i),
			).toHaveText(price);
			expect(
				await this.page
					.locator('//div[@class="inventory_item_img"]//a')
					.nth(i)
					.getAttribute("data-test"),
			).toBe(imgId);
			this.takeScreenshot();
			logger.info(`Element ${i} - Title - ${price}`);
			logger.info(`Element ${i} - Price - ${title}`);
			logger.info(`Element ${i} - Price - ${imgId}`);
		}
	}
}
