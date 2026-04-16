import { APIRequestContext, request } from "@playwright/test";
import { config } from "../../../../../config/environments";
import { logger } from "../../../../../config/logging";
import { RBAuth } from "../../../../utils/restfull-booker/RBAuth";
import { test, expect } from "@playwright/test";

// const validBooking = (): IRBBooking => ({
// 	roomid: randomInt(100),
// 	firstname: "James",
// 	lastname: "Dean",
// 	depositpaid: true,
// 	email: "test@email.com",
// 	phone: "07123456789",
// 	bookingdates: {
// 		checkin: "2026-03-06",
// 		checkout: "2026-03-07",
// 	},
// });

// const bookingId: string = "";
let apiInstance: APIRequestContext;

let rbAuth: RBAuth;
// let rbBookig: RBBooking;

test.beforeAll(async () => {
	const context = await request.newContext({
		baseURL: config.RESTFUL_API_BASE_URL,
	});
	apiInstance = context;
	rbAuth = new RBAuth(apiInstance);
});

test.beforeEach(async () => {
	await rbAuth.login();
	logger.info("Server Up & Running");
	// 2. Create a fresh booking so every test has a valid ID to work with
	// const createRes = await rbBookigcreateBooking(RBAuth.authToken!);
	// logger.info("Dummy Booking created");
	// const createBody = await createRes.json();
	// bookingId = createBody.bookingid;
});

// test.afterEach(async () => {
//     await deleteBooking(RBAuth.authToken!, Number(bookingId));
//     logger.info("Dummy Booking Deleted");
// });

test.describe("Booking", { tag: "@booking" }, () => {
	test("TC1 – HealthCheck GET /ping", async ({}) => {
		const response = await apiInstance.get(`/api/booking/actuator/health`);
		expect(response.status()).toBe(200);
		const data = await response.json();
		expect(data.groups).toBeDefined();
		expect(data.status).toBeDefined();
		expect(data.groups).toContain("liveness");
		expect(data.groups).toContain("readiness");
		expect(data.status).toContain("UP");
	});

	test("TC2 – Auth POST /auth", async ({}) => {
		const validRes = await apiInstance.post(`/api/auth/login`, {
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
		const wrongPassRes = await apiInstance.post(`/api/auth/login`, {
			data: { username: "admin", password: "wrongpassword" },
			headers: { "Content-Type": "application/json" },
		});
		expect(wrongPassRes.status()).toBe(401);
		const wrongPassBody = await wrongPassRes.json();
		expect(wrongPassBody.error).toBe("Invalid credentials");

		// ── Wrong username → bad credentials ────────────────────
		const wrongUserRes = await apiInstance.post(`/api/auth/login`, {
			data: { username: "unknownuser", password: "password" },
			headers: { "Content-Type": "application/json" },
		});
		expect(wrongUserRes.status()).toBe(401);
		const wrongUserBody = await wrongUserRes.json();
		expect(wrongUserBody.error).toBe("Invalid credentials");

		// ── Empty credentials ────────────────────────────────────
		const emptyRes = await apiInstance.post(`/api/auth/login`, {
			data: { username: "", password: "" },
			headers: { "Content-Type": "application/json" },
		});
		expect(emptyRes.status()).toBe(401);
		const emptyBody = await emptyRes.json();
		expect(emptyBody.error).toBe("Invalid credentials");

		// ── Missing body entirely ────────────────────────────────
		const missingRes = await apiInstance.post(`/api/auth/login`, {
			data: {},
			headers: { "Content-Type": "application/json" },
		});
		expect(missingRes.status()).toBe(401);
		const missingBody = await missingRes.json();
		expect(missingBody.error).toBeDefined();

		// ── Response time SLA ────────────────────────────────────
		const start = Date.now();
		await apiInstance.post(`/api/auth/login`, {
			data: { username: "admin", password: "password" },
			headers: { "Content-Type": "application/json" },
		});
		expect(Date.now() - start).toBeLessThan(5000);
	});

	// test("TC4 – CreateBooking POST /booking", async ({}) => {
	//     const payload = validBooking();

	//     // ── Full valid booking ───────────────────────────────────
	//     const res = await apiInstance.post(`/booking`, {
	//         data: payload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//         },
	//     });
	//     expect(res.status()).toBe(200);
	//     const body = await res.json();

	//     // Response structure
	//     expect(body).toHaveProperty("bookingid");
	//     expect(typeof body.bookingid).toBe("number");
	//     expect(body).toHaveProperty("booking");

	//     // All fields match payload
	//     expect(body.booking.firstname).toBe(payload.firstname);
	//     expect(body.booking.lastname).toBe(payload.lastname);
	//     expect(body.booking.totalprice).toBe(payload.totalprice);
	//     expect(body.booking.depositpaid).toBe(payload.depositpaid);
	//     expect(body.booking.additionalneeds).toBe(payload.additionalneeds);
	//     expect(body.booking.bookingdates.checkin).toBe(
	//         payload.bookingdates.checkin,
	//     );
	//     expect(body.booking.bookingdates.checkout).toBe(
	//         payload.bookingdates.checkout,
	//     );

	//     // Content-Type
	//     expect(res.headers()["content-type"]).toContain("application/json");

	//     // ── Without additionalneeds (optional field) ─────────────
	//     const noExtrasPayload = validBooking();
	//     const { additionalneeds, ...payloadWithoutExtras } = noExtrasPayload;
	//     const noExtrasRes = await apiInstance.post(`/booking`, {
	//         data: noExtrasPayload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//         },
	//     });
	//     expect(noExtrasRes.status()).toBe(200);
	//     expect(await noExtrasRes.json()).toHaveProperty("bookingid");

	//     // ── totalprice = 0 edge case ─────────────────────────────
	//     const zeroPrice = await apiInstance.post(`/booking`, {
	//         data: { ...validBooking(), totalprice: 0 },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//         },
	//     });
	//     expect(zeroPrice.status()).toBe(200);
	//     expect((await zeroPrice.json()).booking.totalprice).toBe(0);

	//     // ── depositpaid = false edge case ────────────────────────
	//     const falseDeposit = await apiInstance.post(`/booking`, {
	//         data: { ...validBooking(), depositpaid: false },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//         },
	//     });
	//     expect(falseDeposit.status()).toBe(200);
	//     expect((await falseDeposit.json()).booking.depositpaid).toBe(false);

	//     // ── Missing required fields → 400/500 ───────────────────
	//     const missingFields = await apiInstance.post(`/booking`, {
	//         data: { firstname: "OnlyFirst" },
	//         headers: { "Content-Type": "application/json" },
	//     });
	//     expect([400, 500]).toContain(missingFields.status());

	//     // ── Empty body → 400/500 ─────────────────────────────────
	//     const emptyBody = await apiInstance.post(`/booking`, {
	//         data: {},
	//         headers: { "Content-Type": "application/json" },
	//     });
	//     expect([400, 500]).toContain(emptyBody.status());

	//     // ── Response time SLA ────────────────────────────────────
	//     const start = Date.now();
	//     await apiInstance.post(`/booking`, {
	//         data: validBooking(),
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//         },
	//     });
	//     expect(Date.now() - start).toBeLessThan(5000);
	// });

	// // ============================================================
	// //  TEST CASE 5 – GetBooking  GET /booking/:id
	// // ============================================================
	// test("TC5 – GetBooking GET /booking/:id", async ({}) => {
	//     // ── Valid ID → 200 with full booking details ─────────────
	//     const res = await apiInstance.get(`/booking/${bookingId}`);
	//     expect(res.status()).toBe(200);

	//     const body = await res.json();

	//     // All fields present
	//     expect(body).toHaveProperty("firstname");
	//     expect(body).toHaveProperty("lastname");
	//     expect(body).toHaveProperty("totalprice");
	//     expect(body).toHaveProperty("depositpaid");
	//     expect(body).toHaveProperty("bookingdates");
	//     expect(body.bookingdates).toHaveProperty("checkin");
	//     expect(body.bookingdates).toHaveProperty("checkout");

	//     // Type validation
	//     expect(typeof body.firstname).toBe("string");
	//     expect(typeof body.lastname).toBe("string");
	//     expect(typeof body.totalprice).toBe("number");
	//     expect(typeof body.depositpaid).toBe("boolean");
	//     expect(typeof body.bookingdates.checkin).toBe("string");
	//     expect(typeof body.bookingdates.checkout).toBe("string");

	//     // Date format YYYY-MM-DD
	//     expect(body.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	//     expect(body.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);

	//     // Values match what was created in beforeEach
	//     const booking = validBooking();
	//     expect(body.firstname).toBe(booking.firstname);
	//     expect(body.lastname).toBe(booking.lastname);
	//     expect(body.totalprice).toBe(booking.totalprice);

	//     // Content-Type
	//     expect(res.headers()["content-type"]).toContain("application/json");

	//     // ── Non-existent ID → 404 ────────────────────────────────
	//     const notFound = await apiInstance.get(`/booking/999999`);
	//     expect(notFound.status()).toBe(404);

	//     // ── ID = 0 (boundary) ────────────────────────────────────
	//     const zeroId = await apiInstance.get(`/booking/0`);
	//     expect([400, 404]).toContain(zeroId.status());

	//     // ── Non-numeric ID ───────────────────────────────────────
	//     const alphaId = await apiInstance.get(`/booking/abc`);
	//     expect([400, 404]).toContain(alphaId.status());

	//     // ── Negative ID ──────────────────────────────────────────
	//     const negativeId = await apiInstance.get(`/booking/-1`);
	//     expect([400, 404]).toContain(negativeId.status());

	//     // ── Response time SLA ────────────────────────────────────
	//     const start = Date.now();
	//     await apiInstance.get(`/booking/${bookingId}`);
	//     expect(Date.now() - start).toBeLessThan(5000);
	// });

	// // ============================================================
	// //  TEST CASE 6 – UpdateBooking  PUT /booking/:id
	// // ============================================================
	// test("TC6 – UpdateBooking PUT /booking/:id", async ({}) => {
	//     const updatedPayload = {
	//         firstname: "John",
	//         lastname: "Smith",
	//         totalprice: 250,
	//         depositpaid: false,
	//         bookingdates: { checkin: "2025-07-01", checkout: "2025-07-15" },
	//         additionalneeds: "Lunch",
	//     };

	//     // ── Full update with Cookie token → 200 ─────────────────
	//     const res = await apiInstance.put(`/booking/${bookingId}`, {
	//         data: updatedPayload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect(res.status()).toBe(200);

	//     const body = await res.json();
	//     expect(body.firstname).toBe(updatedPayload.firstname);
	//     expect(body.lastname).toBe(updatedPayload.lastname);
	//     expect(body.totalprice).toBe(updatedPayload.totalprice);
	//     expect(body.depositpaid).toBe(updatedPayload.depositpaid);
	//     expect(body.bookingdates.checkin).toBe(
	//         updatedPayload.bookingdates.checkin,
	//     );
	//     expect(body.bookingdates.checkout).toBe(
	//         updatedPayload.bookingdates.checkout,
	//     );
	//     expect(body.additionalneeds).toBe(updatedPayload.additionalneeds);
	//     expect(res.headers()["content-type"]).toContain("application/json");

	//     // ── Full update with Basic Auth → 200 ───────────────────
	//     const credentials = Buffer.from("admin:password123").toString("base64");
	//     const basicAuthRes = await apiInstance.put(`/booking/${bookingId}`, {
	//         data: updatedPayload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Authorization: `Basic ${credentials}`,
	//         },
	//     });
	//     expect(basicAuthRes.status()).toBe(200);

	//     // ── No auth → 403 ────────────────────────────────────────
	//     const noAuthRes = await apiInstance.put(`/booking/${bookingId}`, {
	//         data: updatedPayload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//         },
	//     });
	//     expect(noAuthRes.status()).toBe(403);

	//     // ── Invalid token → 403 ──────────────────────────────────
	//     const invalidTokenRes = await apiInstance.put(`/booking/${bookingId}`, {
	//         data: updatedPayload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: "token=invalidtoken999",
	//         },
	//     });
	//     expect(invalidTokenRes.status()).toBe(403);

	//     // ── Non-existent booking ID → 404/405 ───────────────────
	//     const notFoundRes = await apiInstance.put(`/booking/999999`, {
	//         data: updatedPayload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect([404, 405]).toContain(notFoundRes.status());

	//     // ── Missing required fields → 400/500 ───────────────────
	//     const badPayloadRes = await apiInstance.put(`/booking/${bookingId}`, {
	//         data: { firstname: "Incomplete" },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect([400, 500]).toContain(badPayloadRes.status());

	//     // ── Response time SLA ────────────────────────────────────
	//     const start = Date.now();
	//     await apiInstance.put(`/booking/${bookingId}`, {
	//         data: updatedPayload,
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect(Date.now() - start).toBeLessThan(5000);
	// });

	// // ============================================================
	// //  TEST CASE 7 – PartialUpdateBooking  PATCH /booking/:id
	// // ============================================================
	// test("TC7 – PartialUpdateBooking PATCH /booking/:id", async ({}) => {
	//     // ── Patch firstname + lastname only ─────────────────────
	//     const nameRes = await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: { firstname: "PatchedFirst", lastname: "PatchedLast" },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect(nameRes.status()).toBe(200);
	//     const nameBody = await nameRes.json();
	//     expect(nameBody.firstname).toBe("PatchedFirst");
	//     expect(nameBody.lastname).toBe("PatchedLast");
	//     // Other fields still present (not wiped out)
	//     expect(nameBody).toHaveProperty("totalprice");
	//     expect(nameBody).toHaveProperty("depositpaid");
	//     expect(nameBody).toHaveProperty("bookingdates");
	//     expect(nameRes.headers()["content-type"]).toContain("application/json");

	//     // ── Patch totalprice only ────────────────────────────────
	//     const priceRes = await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: { totalprice: 999 },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect(priceRes.status()).toBe(200);
	//     expect((await priceRes.json()).totalprice).toBe(999);

	//     // ── Patch depositpaid only ───────────────────────────────
	//     const depositRes = await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: { depositpaid: false },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect(depositRes.status()).toBe(200);
	//     expect((await depositRes.json()).depositpaid).toBe(false);

	//     // ── Patch bookingdates only ──────────────────────────────
	//     const datesRes = await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: {
	//             bookingdates: { checkin: "2026-01-01", checkout: "2026-01-15" },
	//         },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect(datesRes.status()).toBe(200);
	//     const datesBody = await datesRes.json();
	//     expect(datesBody.bookingdates.checkin).toBe("2026-01-01");
	//     expect(datesBody.bookingdates.checkout).toBe("2026-01-15");

	//     // ── Patch with Basic Auth → 200 ──────────────────────────
	//     const credentials = Buffer.from("admin:password123").toString("base64");
	//     const basicRes = await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: { additionalneeds: "Dinner" },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Authorization: `Basic ${credentials}`,
	//         },
	//     });
	//     expect(basicRes.status()).toBe(200);
	//     expect((await basicRes.json()).additionalneeds).toBe("Dinner");

	//     // ── No auth → 403 ────────────────────────────────────────
	//     const noAuthRes = await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: { firstname: "NoAuth" },
	//         headers: { "Content-Type": "application/json" },
	//     });
	//     expect(noAuthRes.status()).toBe(403);

	//     // ── Invalid token → 403 ──────────────────────────────────
	//     const invalidRes = await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: { firstname: "BadToken" },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Cookie: "token=badtoken000",
	//         },
	//     });
	//     expect(invalidRes.status()).toBe(403);

	//     // ── Non-existent ID → 404/405 ────────────────────────────
	//     const notFoundRes = await apiInstance.patch(`/booking/999999`, {
	//         data: { firstname: "Ghost" },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect([404, 405]).toContain(notFoundRes.status());

	//     // ── Response time SLA ────────────────────────────────────
	//     const start = Date.now();
	//     await apiInstance.patch(`/booking/${bookingId}`, {
	//         data: { firstname: "SLACheck" },
	//         headers: {
	//             "Content-Type": "application/json",
	//             Accept: "application/json",
	//             Cookie: `token=${authToken}`,
	//         },
	//     });
	//     expect(Date.now() - start).toBeLessThan(5000);
	// });

	// // ============================================================
	// //  TEST CASE 8 – DeleteBooking  DELETE /booking/:id
	// // ============================================================
	// test("TC8 – DeleteBooking DELETE /booking/:id", async ({}) => {
	//     // Helper – create a fresh booking and return its ID
	//     const makeBooking = async () => {
	//         const r = await apiInstance.post(`/booking`, {
	//             data: validBooking(),
	//             headers: {
	//                 "Content-Type": "application/json",
	//                 Accept: "application/json",
	//             },
	//         });
	//         return (await r.json()).bookingid;
	//     };

	//     // ── Successful delete with Cookie token → 201 ───────────
	//     const delRes = await apiInstance.delete(`/booking/${bookingId}`, {
	//         headers: { Cookie: `token=${authToken}` },
	//     });
	//     expect(delRes.status()).toBe(201);
	//     const delBody = await delRes.text();
	//     expect(delBody.trim().toLowerCase()).toContain("created");

	//     // ── Deleted booking should return 404 on GET ─────────────
	//     const getAfterDel = await apiInstance.get(`/booking/${bookingId}`);
	//     expect(getAfterDel.status()).toBe(404);

	//     // ── Double delete → 404/405 ──────────────────────────────
	//     const doubleDelete = await apiInstance.delete(`/booking/${bookingId}`, {
	//         headers: { Cookie: `token=${authToken}` },
	//     });
	//     expect([404, 405]).toContain(doubleDelete.status());

	//     // ── Delete with Basic Auth → 201 ─────────────────────────
	//     const idForBasic = await makeBooking();
	//     const credentials = Buffer.from("admin:password123").toString("base64");
	//     const basicDelRes = await apiInstance.delete(`/booking/${idForBasic}`, {
	//         headers: { Authorization: `Basic ${credentials}` },
	//     });
	//     expect(basicDelRes.status()).toBe(201);

	//     // ── No auth → 403, booking still exists ──────────────────
	//     const idForNoAuth = await makeBooking();
	//     const noAuthRes = await apiInstance.delete(`/booking/${idForNoAuth}`);
	//     expect(noAuthRes.status()).toBe(403);
	//     const stillExists = await apiInstance.get(`/booking/${idForNoAuth}`);
	//     expect(stillExists.status()).toBe(200);

	//     // ── Invalid token → 403 ──────────────────────────────────
	//     const idForBadToken = await makeBooking();
	//     const badTokenRes = await apiInstance.delete(
	//         `/booking/${idForBadToken}`,
	//         {
	//             headers: { Cookie: "token=invalidtoken123" },
	//         },
	//     );
	//     expect(badTokenRes.status()).toBe(403);

	//     // ── Non-existent booking ID → 404/405 ───────────────────
	//     const notFoundRes = await apiInstance.delete(`/booking/999999`, {
	//         headers: { Cookie: `token=${authToken}` },
	//     });
	//     expect([404, 405]).toContain(notFoundRes.status());

	//     // ── Response time SLA ────────────────────────────────────
	//     const idForSLA = await makeBooking();
	//     const start = Date.now();
	//     await apiInstance.delete(`/booking/${idForSLA}`, {
	//         headers: { Cookie: `token=${authToken}` },
	//     });
	//     expect(Date.now() - start).toBeLessThan(5000);
	// });
});
