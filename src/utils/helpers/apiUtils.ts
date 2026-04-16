import { APIRequestContext, request } from "@playwright/test";
export class APIUtils {
    private apiContext: APIRequestContext;
    constructor(apiContext: APIRequestContext) {
        this.apiContext = apiContext;
    }
    public get apiContextInstance(): APIRequestContext {
        return this.apiContext;
    }
}
