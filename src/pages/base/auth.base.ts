import fs from "node:fs";
import path from "node:path";
import type { BrowserContext, Page } from "@playwright/test";

export abstract class AuthBasePage {
	protected page: Page;
	protected context: BrowserContext;
	protected AUTH_DIR: string = "./auth";
	protected BASE_URL: string;
	protected INVENTORY_URL: string;

	constructor(page: Page, context: BrowserContext, baseUrl: string) {
		this.BASE_URL = baseUrl;
		this.page = page;
		this.context = context;
		this.INVENTORY_URL = `${this.BASE_URL}/inventory.html`;
	}

	// ── Helpers ─────────────────────────────────────────────────────────────
	protected getTokenPath(username: string) {
		return path.join(this.AUTH_DIR, `${username}.json`);
	}

	protected async ensureAuthDir() {
		if (!fs.existsSync(this.AUTH_DIR)) {
			fs.mkdirSync(this.AUTH_DIR, { recursive: true });
		}
	}
}
