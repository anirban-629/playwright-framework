import * as fs from "fs";
import * as path from "path";
import { encrypt, decrypt } from "./encryption";
import { loginViaApi } from "./token.store";

interface TokenCache {
	accessToken: string;
	expiresAt: number; // Unix ms
	userId: string;
}

const AUTH_DIR = path.resolve(".auth");
const TOKEN_FILE = path.join(AUTH_DIR, "tokens.enc");
const EXPIRY_BUFFER_MS = 60_000; // Refresh 1 min before actual expiry

class TokenManager {
	private static instance: TokenManager;
	private memoryCache = new Map<string, TokenCache>();

	// Singleton — one instance across the whole test run
	static getInstance(): TokenManager {
		if (!TokenManager.instance) {
			TokenManager.instance = new TokenManager();
		}
		return TokenManager.instance;
	}

	async getToken(userId: string, password: string): Promise<string> {
		// 1. Check in-memory cache first (fastest)
		const cached = this.memoryCache.get(userId);
		if (cached && this.isValid(cached)) {
			return cached.accessToken;
		}

		// 2. Check encrypted file cache
		const fileCached = this.readFromFile(userId);
		if (fileCached && this.isValid(fileCached)) {
			this.memoryCache.set(userId, fileCached); // warm memory cache
			return fileCached.accessToken;
		}

		// 3. Call login API and store fresh token
		return this.refreshToken(userId, password);
	}

	async refreshToken(userId: string, password: string): Promise<string> {
		const { token, expiresIn } = await loginViaApi(userId, password);
		const cache: TokenCache = {
			accessToken: token,
			expiresAt: Date.now() + expiresIn * 1000,
			userId,
		};
		this.memoryCache.set(userId, cache);
		this.writeToFile(userId, cache);
		return token;
	}

	invalidate(userId: string): void {
		this.memoryCache.delete(userId);
		// Remove from file cache too
		const all = this.readAllFromFile();
		delete all[userId];
		this.writeAllToFile(all);
	}

	private isValid(cache: TokenCache): boolean {
		return Date.now() < cache.expiresAt - EXPIRY_BUFFER_MS;
	}

	private readFromFile(userId: string): TokenCache | null {
		try {
			const all = this.readAllFromFile();
			return all[userId] ?? null;
		} catch {
			return null;
		}
	}

	private readAllFromFile(): Record<string, TokenCache> {
		if (!fs.existsSync(TOKEN_FILE)) return {};
		const raw = fs.readFileSync(TOKEN_FILE, "utf-8");
		return JSON.parse(decrypt(raw));
	}

	private writeToFile(userId: string, cache: TokenCache): void {
		const all = this.readAllFromFile();
		all[userId] = cache;
		this.writeAllToFile(all);
	}

	private writeAllToFile(data: Record<string, TokenCache>): void {
		if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });
		fs.writeFileSync(TOKEN_FILE, encrypt(JSON.stringify(data)), "utf-8");
	}
}

export const tokenManager = TokenManager.getInstance();
