// biome-ignore assist/source/organizeImports: < >
import fs from "node:fs";
import { AuthBasePage } from "../base/auth.base";
import { expect } from "@playwright/test";
import { logger } from "../../../config/logging";

export class AuthPage extends AuthBasePage {
	// ── Locators ────────────────────────────────────────────────────────────

	private get errorMessage() {
		return this.page.locator("[data-test='error']");
	}

	// ── Validations ──────────────────────────────────────────────────────────
	async isOnInventoryPage(): Promise<boolean> {
		return this.page.url().includes("inventory");
	}

	async isSessionValid(): Promise<boolean> {
		await this.page.goto(this.INVENTORY_URL);
		return this.isOnInventoryPage();
	}

	async hasErrorMessage(): Promise<boolean> {
		return this.errorMessage.isVisible();
	}

	// ── Actions ──────────────────────────────────────────────────────────────
	private async fillCredentials(username: string): Promise<void> {
		await this.page.locator('[data-test="username"]').click();
		await this.page.locator('[data-test="username"]').fill(username);
		await this.page.locator('[data-test="password"]').click();
		await this.page.locator('[data-test="password"]').fill("secret_sauce");
	}

	private async submitLogin(): Promise<void> {
		await this.page.locator('[data-test="login-button"]').click();
		await expect(this.page.getByText("Swag Labs")).toBeVisible();
		await expect(this.page.locator('[data-test="title"]')).toBeVisible();
		await this.page.waitForURL("**/inventory.html", { timeout: 10_000 });
	}

	private async saveSession(username: string): Promise<void> {
		this.ensureAuthDir();
		await this.context.storageState({ path: this.getTokenPath(username) });
		logger.info(`[${username}] - Session saved`);
	}

	private async loadSession(username: string): Promise<void> {
		const storage = JSON.parse(
			fs.readFileSync(this.getTokenPath(username), "utf-8"),
		);
		await this.context.addCookies(storage.cookies ?? []);
	}

	// ── Main Entry Point (used by fixture) ───────────────────────────────────
	async loginIfNeeded(
		username: "standard_user" | "visual_user",
	): Promise<void> {
		const tokenPath = this.getTokenPath(username);
		// Step 1: Try existing session
		if (fs.existsSync(tokenPath)) {
			logger.info(`[${username}] Session found — trying to reuse...`);
			await this.loadSession(username);
			if (await this.isSessionValid()) {
				logger.info(`[${username}] Session valid — skipping login\n`);
				return;
			}

			logger.info(`[${username}] Session expired — logging in fresh...`);
		} else {
			logger.info(`[${username}] No session found — logging in fresh...`);
		}

		// Step 2: Fresh login
		await this.page.goto(this.BASE_URL);
		await this.fillCredentials(username);
		await this.submitLogin();
		await this.saveSession(username);
	}
}
