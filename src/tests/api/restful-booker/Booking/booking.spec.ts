import { randomInt } from "node:crypto";
import { test, expect } from "../../../../fixtures";
import { logger } from "../../../../../config/logging";

const getData = () => ({
	roomid: randomInt(100),
	firstname: "James",
	lastname: "Dean",
	depositpaid: true,
	email: "test@email.com",
	phone: "07123456789",
	bookingdates: {
		checkin: "2026-03-06",
		checkout: "2026-03-07",
	},
});

test.beforeAll(({}, testInfo) => {
	logger.testStart(testInfo.title);
});

test.afterAll(({}, testInfo) => {
	logger.testEnd(testInfo.title, testInfo.status ? "PASSED" : "FAILED");
});

test.describe("Booking", { tag: ["@booking", "@rbooker"] }, () => {
	test("TC1 - HealthCheck GET /ping", async ({ rbAPI }) => {
		const response = await rbAPI.get(`/api/booking/actuator/health`);
		expect(response.status()).toBe(200);
		const data = await response.json();
		expect(data.groups).toBeDefined();
		expect(data.status).toBeDefined();
		expect(data.groups).toContain("liveness");
		expect(data.groups).toContain("readiness");
		expect(data.status).toContain("UP");
	});

	test("TC2 - Create Booking", async ({ rbAPI }) => {
		const response = await rbAPI.post("/api/booking/1", {
			data: getData(),
		});
		logger.info(response.status().toString());
		expect(response.status()).toBe(201);
		const data = await response.json();
		logger.info(String(data));
	});

	test("TC3 - GET /booking returns a list of booking IDs", async ({
		rbAPI,
	}) => {
		const response = await rbAPI.get("/api/booking");
		expect(response.status()).toBe(200);
		const body = await response.json();
		expect(Array.isArray(body)).toBe(true);
		expect(body.length).toBeGreaterThan(0);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		body.forEach((item: any) => {
			expect(item).toHaveProperty("bookingid");
			expect(typeof item.bookingid).toBe("number");
		});
	});
});
