// fixtures/token-store.ts
import * as fs from "node:fs";
import * as path from "node:path";
import { decrypt, encrypt } from "../helpers/encryption";
import { config } from "../../../config/environments";
import { logger } from "../../../config/logging";

const TOKEN_FILE = path.resolve(
	process.cwd(),
	"./auth-sessions/RestfullBooker/.enc",
);

interface TokenPayload {
	token: string;
	fetchedAt: number; // epoch ms
}

// In-memory cache per worker process
let memoryCache: TokenPayload | null = null;

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns a valid token.
 * Priority: memory cache → .enc file → fresh auth call
 */

export async function getToken(URL: string): Promise<string> {
	if (memoryCache) {
		logger.info("Memory Cache available. Returning Token...");
		return memoryCache.token;
	}
	logger.info("Memory Cache not loaded. Trying to read token from file...");
	const fromFile = readFromFile();
	if (fromFile) {
		memoryCache = fromFile;
		return fromFile.token;
	}

	return fetchAndStore(URL);
}

/**
 * Forces a fresh auth call, overwrites .enc + memory cache.
 * Called automatically by the self-healing proxy on 401/403.
 */
export async function refreshToken(URL: string): Promise<string> {
	memoryCache = null;
	return fetchAndStore(URL);
}

// ─── Internal ────────────────────────────────────────────────────────────────

async function fetchAndStore(URL: string): Promise<string> {
	logger.warn("Trying to fetch token from encrypted file");
	const token = await fetchTokenFromAPI(URL);
	logger.warn("Token found");
	const payload: TokenPayload = { token, fetchedAt: Date.now() };

	writeToFile(payload);
	memoryCache = payload;

	return token;
}

async function fetchTokenFromAPI(URL: string): Promise<string> {
	const username = config.RB_USERNAME;
	const password = config.RB_PASSWORD;

	if (!username || !password) {
		throw new Error(
			"[token-store] RB_USERNAME and RB_PASSWORD must be set in your environment / .env file",
		);
	}
	logger.warn("Re-creating token - Calling login api");
	const response = await fetch(URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({ username, password }),
	});

	if (!response.ok) {
		throw new Error(
			`[token-store] Auth request failed — HTTP ${response.status}`,
		);
	}

	const body = await response.json();

	// Restful Booker returns { token: "abc123" } on success
	// and { reason: "Bad credentials" } on failure (still HTTP 200)
	if (!body.token || body.token === "Bad credentials") {
		throw new Error(
			`[token-store] Auth rejected — check RB_USERNAME / RB_PASSWORD`,
		);
	}

	return body.token as string;
}

// ─── File I/O ─────────────────────────────────────────────────────────────────

function readFromFile(): TokenPayload | null {
	try {
		if (!fs.existsSync(TOKEN_FILE)) return null;
		logger.info("Retrieving encrypted data from the .enc file");
		const encrypted = fs.readFileSync(TOKEN_FILE, "utf-8").trim();
		const decrypted = decrypt(encrypted);
		const payload: TokenPayload = JSON.parse(decrypted);
		return payload;
	} catch {
		// Corrupted or unreadable file — treat as cache miss, fetch fresh
		logger.warn("[token-store] Could not read .auth/token.enc — will re-fetch");
		return null;
	}
}

function writeToFile(payload: TokenPayload): void {
	const dir = path.dirname(TOKEN_FILE);

	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	const encrypted = encrypt(JSON.stringify(payload));
	logger.info("Writing encrypted data to the .enc file");
	fs.writeFileSync(TOKEN_FILE, encrypted, "utf-8");
}
