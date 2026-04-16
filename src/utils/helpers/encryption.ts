// utils/crypto.ts
import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	scryptSync,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits — GCM auth tag

// ─── Key derivation ──────────────────────────────────────────────────────────

/**
 * Derives a 256-bit key from the master secret using scrypt.
 * scrypt is memory-hard — brute-forcing the passphrase is expensive.
 */
function deriveKey(salt: Buffer): Buffer {
	const secret = process.env.CRYPTO_SECRET;

	if (!secret || secret.length < 32) {
		throw new Error(
			"[crypto] CRYPTO_SECRET must be set in your .env and be at least 32 characters long",
		);
	}

	return scryptSync(secret, salt, KEY_LENGTH);
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Encrypts a plaintext string.
 *
 * Output format (all base64, colon-delimited):
 *   <salt>:<iv>:<authTag>:<ciphertext>
 *
 * - salt      → random 32 bytes, used to derive the key via scrypt
 * - iv        → random 16 bytes, unique per encryption
 * - authTag   → 16-byte GCM authentication tag (detects tampering)
 * - ciphertext → AES-256-GCM encrypted payload
 */
export function encrypt(plaintext: string): string {
	const salt = randomBytes(SALT_LENGTH);
	const iv = randomBytes(IV_LENGTH);
	const key = deriveKey(salt);

	const cipher = createCipheriv(ALGORITHM, key, iv, {
		authTagLength: TAG_LENGTH,
	});

	const encrypted = Buffer.concat([
		cipher.update(plaintext, "utf-8"),
		cipher.final(),
	]);

	const authTag = cipher.getAuthTag();

	return [
		salt.toString("base64"),
		iv.toString("base64"),
		authTag.toString("base64"),
		encrypted.toString("base64"),
	].join(":");
}

/**
 * Decrypts a string produced by encrypt().
 * Throws if the payload has been tampered with (GCM auth tag mismatch).
 */
export function decrypt(ciphertext: string): string {
	const parts = ciphertext.split(":");

	if (parts.length !== 4) {
		throw new Error(
			"[crypto] Invalid ciphertext format — expected salt:iv:authTag:data",
		);
	}

	const [saltB64, ivB64, authTagB64, dataB64] = parts;

	const salt = Buffer.from(saltB64, "base64");
	const iv = Buffer.from(ivB64, "base64");
	const authTag = Buffer.from(authTagB64, "base64");
	const data = Buffer.from(dataB64, "base64");
	const key = deriveKey(salt);

	const decipher = createDecipheriv(ALGORITHM, key, iv, {
		authTagLength: TAG_LENGTH,
	});

	decipher.setAuthTag(authTag);

	const decrypted = Buffer.concat([
		decipher.update(data),
		decipher.final(), // throws here if authTag doesn't match
	]);

	return decrypted.toString("utf-8");
}
