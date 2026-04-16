import { APIRequestContext, APIResponse, request } from "@playwright/test";
import { logger } from "../../../config/logging";

export class RBAuth {
    private apiInstance: APIRequestContext;
    private _authToken: string | null = null;

    constructor(apiInstance: APIRequestContext) {
        this.apiInstance = apiInstance;
    }

    public set authToken(token: string | null) {
        this._authToken = token;
    }

    public get authToken(): string | null {
        return this._authToken;
    }

    login = async () => {
        const response: APIResponse = await this.apiInstance.post(
            "/api/auth/login",
            {
                data: { username: "admin", password: "password" },
                headers: { "Content-Type": "application/json" },
            },
        );
        const data = await response.json();
        if (response.status() !== 200) {
            logger.error((data as Object).toString());
            throw new Error("Login Failed");
        }
        this.authToken = data.token;
        return data;
    };

    isAuthTokenValid = async (): Promise<Boolean> => {
        let response: APIResponse = await this.apiInstance.post(
            "/api/auth/validate",
            {
                data: { token: this.authToken },
            },
        );

        switch (response.status()) {
            case 200:
                return true;
            default:
                return false;
        }
    };

    refreshAuthToken = async () => {
        this.authToken = null;
        this.login();
    };

    logout = async () => {
        try {
            await this.apiInstance.post("/api/auth/logout", {
                data: { token: this.authToken },
                headers: { "Content-Type": "application/json" },
            });
        } catch (error: any) {
            logger.error(error);
        }
        this.authToken = null;
    };
}
