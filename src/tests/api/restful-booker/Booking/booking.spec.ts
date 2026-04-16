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

test.describe("Booking", { tag: "@booking" }, () => {
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
		const response = await rbAPI.post("/api/booking", {
			data: getData(),
		});
		logger.info(response.status().toString());
		expect(response.status()).toBe(201);
		const data = await response.json();
		logger.info(String(data));
	});
});
