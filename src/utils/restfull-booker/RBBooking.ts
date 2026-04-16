import { APIRequestContext, APIResponse } from "@playwright/test";
import { logger } from "../../../config/logging";
import { IRBBooking, IRBUpdateBooking } from "../../../types";

/**
 * BookingAPI - Handles all booking-related API operations with authentication
 * Manages token lifecycle and enforces authorization checks
 */
export class RBBooking {
	private _token: string | null;
	private apiInstance: APIRequestContext | null;

	constructor(apiInstance: APIRequestContext, token: string) {
		if (!token || !apiInstance) {
			logger.error("Unauthorized - Token or API instance missing");
			throw new Error("Unauthorized: Token and API instance are required");
		}
		this.apiInstance = apiInstance;
		this._token = token;
		logger.info("BookingAPI initialized successfully");
	}

	/**
	 * Get common request headers with authentication
	 */
	private getAuthHeaders(): Record<string, string> {
		return {
			"Content-Type": "application/json",
			Accept: "application/json",
			Cookie: `token=${this._token}`,
		};
	}

	/**
	 * Validate that API instance is ready for requests
	 */
	private validateAuthorization(): void {
		if (!this.apiInstance || !this._token) {
			logger.error(
				"Authorization check failed - API instance or token is null",
			);
			throw new Error("Unauthorized: Missing credentials or API instance");
		}
		logger.debug("Authorization validation passed");
	}

	/**
	 * Create a new booking
	 */
	async createBooking(data: IRBBooking): Promise<APIResponse | undefined> {
		try {
			this.validateAuthorization();
			const response = await this.apiInstance!.post("/api/booking", {
				data,
				headers: this.getAuthHeaders(),
			});
			return response;
		} catch (error) {
			logger.error("Failed to create booking");
			throw error;
		}
	}

	/**
	 * Get booking by ID
	 */
	async getBooking(bookingId: number): Promise<APIResponse | undefined> {
		try {
			this.validateAuthorization();
			logger.info(`Fetching booking with ID: ${bookingId}`);
			const response = await this.apiInstance!.get(
				`/api/booking/${bookingId}`,
				{
					headers: this.getAuthHeaders(),
				},
			);
			logger.info(`Booking ${bookingId} retrieved successfully`);
			return response;
		} catch (error) {
			logger.error(`Failed to fetch booking ${bookingId}`);
			throw error;
		}
	}

	/**
	 * Update an existing booking
	 */
	async updateBooking(
		bookingId: number,
		data: IRBUpdateBooking,
	): Promise<APIResponse | undefined> {
		try {
			this.validateAuthorization();
			logger.info(`Updating booking ${bookingId}`);
			const response = await this.apiInstance!.put(
				`/api/booking/${bookingId}`,
				{
					data,
					headers: this.getAuthHeaders(),
				},
			);
			logger.info(`Booking ${bookingId} updated successfully`);
			return response;
		} catch (error) {
			logger.error(`Failed to update booking ${bookingId}`);
			throw error;
		}
	}

	/**
	 * Delete a booking
	 */
	async deleteBooking(bookingId: number): Promise<APIResponse | undefined> {
		try {
			this.validateAuthorization();
			logger.info(`Deleting booking ${bookingId}`);
			const response = await this.apiInstance!.delete(
				`/api/booking/${bookingId}`,
				{
					headers: this.getAuthHeaders(),
				},
			);
			logger.info(`Booking ${bookingId} deleted successfully`);
			return response;
		} catch (error) {
			logger.error(`Failed to delete booking ${bookingId}`);
			throw error;
		}
	}

	/**
	 * Cleanup - Release resources and clear sensitive data
	 */
	async destroy(): Promise<void> {
		try {
			logger.info("Destroying BookingAPI instance");
			this._token = null;
			this.apiInstance = null;
			logger.info("BookingAPI destroyed successfully");
		} catch (error) {
			logger.error("Error destroying BookingAPI:");
			throw error;
		}
	}
}
