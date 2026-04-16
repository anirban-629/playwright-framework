import {
    APIRequestContext,
    test,
    request,
    APIResponse,
    expect,
} from "@playwright/test";
import { config } from "../../../../../config/environments";

let apiInstance: APIRequestContext;
test.beforeAll(async () => {
    const context = await request.newContext({
        baseURL: config.RESTFUL_API_BASE_URL,
    });
    apiInstance = context;
});

test.describe(
    "Restful Booker API - Authentication",
    { tag: "@restfulbooker" },
    () => {
        test("Health Check - API is up and running", async () => {
            const response: APIResponse = await apiInstance.get(
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

        test("Login & Create token", async () => {
            const response: APIResponse = await apiInstance.post(
                "/api/auth/login",
                {
                    data: {
                        username: "admin",
                        password: "password",
                    },
                },
            );
            expect(response.status()).toBe(200);
            const data = await response.json();
            expect(data.token).toBeDefined();
        });

        test("Validate token", async () => {
            let response: APIResponse = await apiInstance.post(
                "/api/auth/validate",
                { data: { token: "" } },
            );
            expect(response.status()).toBe(401);
            let data = await response.json();
            expect(data.error).toBeDefined();
            expect(data.error).toBe("No token provided");

            response = await apiInstance.post("/api/auth/validate", {
                data: { token: "ABCD" },
            });
            console.log(response.url());
            expect(response.status()).toBe(403);
            data = await response.json();
            expect(data.error).toBeDefined();
            expect(data.error).toBe("Invalid token");

            response = await apiInstance.post("/api/auth/login", {
                data: {
                    username: "admin",
                    password: "password",
                },
            });
            expect(response.status()).toBe(200);
            data = await response.json();

            response = await apiInstance.post("/api/auth/validate", {
                data: { token: data.token },
            });
            console.log(data.token);
            expect(response.status()).toBe(200);
        });
    },
);
