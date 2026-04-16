import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { AuthBasePage } from "../base/auth.base";
import { expect } from "@playwright/test";
import { logger } from "../../../config/logging";
import { decrypt, encrypt } from "../../utils/helpers/encryption";

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
		await this.ensureAuthDir();
		// Write Playwright storage state to a temp file first,
		// then encrypt its contents into the .enc file
		const tmpFile = path.join(os.tmpdir(), `${username}-session.json`);
		try {
			await this.context.storageState({ path: tmpFile });
			const plaintext = fs.readFileSync(tmpFile, "utf-8");
			const encrypted = encrypt(plaintext);
			fs.writeFileSync(this.getTokenPath(username), encrypted, "utf-8");
			logger.info(`[${username}] Session saved (encrypted)`);
		} finally {
			// Always clean up the plaintext temp file — even if encrypt throws
			if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
		}
	}

	private async loadSession(username: string): Promise<void> {
		const encrypted = fs.readFileSync(this.getTokenPath(username), "utf-8");
		const plaintext = decrypt(encrypted.trim());
		const storage = JSON.parse(plaintext);
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
			try {
				await this.loadSession(username);
				if (await this.isSessionValid()) {
					logger.info(`[${username}] Session valid — skipping login\n`);
					return;
				}
				logger.info(`[${username}] Session expired — logging in fresh...`);
			} catch {
				// Corrupted or tampered .enc file — discard and re-login
				logger.warn(
					`[${username}] Could not decrypt session — logging in fresh...`,
				);
				fs.unlinkSync(tokenPath);
			}
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
