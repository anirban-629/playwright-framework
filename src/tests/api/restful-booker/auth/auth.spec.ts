import { APIResponse } from "@playwright/test";
import { test, expect } from "../../../../fixtures";

test.describe(
	"Restful Booker API - Authentication",
	{ tag: ["@restfulbooker_auth", "@rbooker"] },
	() => {
		test("TC1 - Health Check - API is up and running", async ({ rbAPI }) => {
			const response: APIResponse = await rbAPI.get(
				"/api/auth/actuator/health",
			);
			expect(response.status()).toBe(200);
			const data = await response.json();
			expect(data.groups).toBeDefined();
			expect(data.status).toBeDefined();
			expect(data.groups).toContain("liveness");
			expect(data.groups).toContain("readiness");
			expect(data.status).toContain("UP");
		});

		test("TC2 - Login & Create token", async ({ rbAPI }) => {
			const response: APIResponse = await rbAPI.post("/api/auth/login", {
				data: {
					username: "admin",
					password: "password",
				},
			});
			expect(response.status()).toBe(200);
			const data = await response.json();
			expect(data.token).toBeDefined();
		});

		test("TC3 - Validate token", async ({ rbAPI }) => {
			let response: APIResponse = await rbAPI.post("/api/auth/validate", {
				data: { token: "" },
			});
			expect(response.status()).toBe(401);
			let data = await response.json();
			expect(data.error).toBeDefined();
			expect(data.error).toBe("No token provided");

			response = await rbAPI.post("/api/auth/validate", {
				data: { token: "ABCD" },
			});
			console.log(response.url());
			expect(response.status()).toBe(403);
			data = await response.json();
			expect(data.error).toBeDefined();
			expect(data.error).toBe("Invalid token");

			response = await rbAPI.post("/api/auth/login", {
				data: {
					username: "admin",
					password: "password",
				},
			});
			expect(response.status()).toBe(200);
			data = await response.json();

			response = await rbAPI.post("/api/auth/validate", {
				data: { token: data.token },
			});
			console.log(data.token);
			expect(response.status()).toBe(200);
		});

		test("TC4 - Auth POST /auth", async ({ rbAPI }) => {
			const validRes = await rbAPI.post(`/api/auth/login`, {
				data: { username: "admin", password: "password" },
				headers: { "Content-Type": "application/json" },
			});
			expect(validRes.status()).toBe(200);
			const validBody = await validRes.json();
			expect(validBody).toHaveProperty("token");
			expect(typeof validBody.token).toBe("string");
			expect(validBody.token.length).toBeGreaterThan(0);
			expect(validBody.token).not.toBe("Bad credentials");
			expect(validRes.headers()["content-type"]).toContain("application/json");

			// ── Wrong password → bad credentials ────────────────────
			const wrongPassRes = await rbAPI.post(`/api/auth/login`, {
				data: { username: "admin", password: "wrongpassword" },
				headers: { "Content-Type": "application/json" },
			});
			expect(wrongPassRes.status()).toBe(401);
			const wrongPassBody = await wrongPassRes.json();
			expect(wrongPassBody.error).toBe("Invalid credentials");

			// ── Wrong username → bad credentials ────────────────────
			const wrongUserRes = await rbAPI.post(`/api/auth/login`, {
				data: { username: "unknownuser", password: "password" },
				headers: { "Content-Type": "application/json" },
			});
			expect(wrongUserRes.status()).toBe(401);
			const wrongUserBody = await wrongUserRes.json();
			expect(wrongUserBody.error).toBe("Invalid credentials");

			// ── Empty credentials ────────────────────────────────────
			const emptyRes = await rbAPI.post(`/api/auth/login`, {
				data: { username: "", password: "" },
				headers: { "Content-Type": "application/json" },
			});
			expect(emptyRes.status()).toBe(401);
			const emptyBody = await emptyRes.json();
			expect(emptyBody.error).toBe("Invalid credentials");

			// ── Missing body entirely ────────────────────────────────
			const missingRes = await rbAPI.post(`/api/auth/login`, {
				data: {},
				headers: { "Content-Type": "application/json" },
			});
			expect(missingRes.status()).toBe(401);
			const missingBody = await missingRes.json();
			expect(missingBody.error).toBeDefined();

			// ── Response time SLA ────────────────────────────────────
			const start = Date.now();
			await rbAPI.post(`/api/auth/login`, {
				data: { username: "admin", password: "password" },
				headers: { "Content-Type": "application/json" },
			});
			expect(Date.now() - start).toBeLessThan(5000);
		});
	},
);
