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

// async createBooking(data: IRBBooking): Promise<APIResponse | undefined> {
// 		try {
// 			this.validateAuthorization();
// 			const response = await this.apiInstance!.post("/api/booking", {
// 				data,
// 				headers: this.getAuthHeaders(),
// 			});
// 			return response;
// 		} catch (error) {
// 			logger.error("Failed to create booking");
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * Get booking by ID
// 	 */
// 	async getBooking(bookingId: number): Promise<APIResponse | undefined> {
// 		try {
// 			this.validateAuthorization();
// 			logger.info(`Fetching booking with ID: ${bookingId}`);
// 			const response = await this.apiInstance!.get(
// 				`/api/booking/${bookingId}`,
// 				{
// 					headers: this.getAuthHeaders(),
// 				},
// 			);
// 			logger.info(`Booking ${bookingId} retrieved successfully`);
// 			return response;
// 		} catch (error) {
// 			logger.error(`Failed to fetch booking ${bookingId}`);
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * Update an existing booking
// 	 */
// 	async updateBooking(
// 		bookingId: number,
// 		data: IRBUpdateBooking,
// 	): Promise<APIResponse | undefined> {
// 		try {
// 			this.validateAuthorization();
// 			logger.info(`Updating booking ${bookingId}`);
// 			const response = await this.apiInstance!.put(
// 				`/api/booking/${bookingId}`,
// 				{
// 					data,
// 					headers: this.getAuthHeaders(),
// 				},
// 			);
// 			logger.info(`Booking ${bookingId} updated successfully`);
// 			return response;
// 		} catch (error) {
// 			logger.error(`Failed to update booking ${bookingId}`);
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * Delete a booking
// 	 */
// 	async deleteBooking(bookingId: number): Promise<APIResponse | undefined> {
// 		try {
// 			this.validateAuthorization();
// 			logger.info(`Deleting booking ${bookingId}`);
// 			const response = await this.apiInstance!.delete(
// 				`/api/booking/${bookingId}`,
// 				{
// 					headers: this.getAuthHeaders(),
// 				},
// 			);
// 			logger.info(`Booking ${bookingId} deleted successfully`);
// 			return response;
// 		} catch (error) {
// 			logger.error(`Failed to delete booking ${bookingId}`);
// 			throw error;
// 		}
// 	}
