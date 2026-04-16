// import {
// 	APIRequestContext,
// 	test as base,
// 	request as playwrightRequest,
// } from "@playwright/test";
// import { config } from "../../config/environments";

// type AuthFixtures = {
// 	rbAPI: APIRequestContext;
// };

// export const apiTest = base.extend<AuthFixtures>({
// 	// eslint-disable-next-line no-empty-pattern
// 	rbAPI: async ({}, use) => {
// 		const token: string | null = null;
// 		const apiContext = await playwrightRequest.newContext({
// 			baseURL: config.RESTFUL_API_BASE_URL,
// 			extraHTTPHeaders: {
// 				Accept: "application/json",
// 				"Content-Type": "application/json",
// 				Cookie: `token=${token}`,
// 			},
// 		});
// 		await use(apiContext);
// 		await apiContext.dispose();
// 	},
// });

import {
	APIRequestContext,
	APIResponse,
	test as base,
	request as playwrightRequest,
} from "@playwright/test";
import { config } from "../../config/environments";
import { logger } from "../../config/logging";
import { getToken, refreshToken } from "../utils/helpers/token.store";

type AuthFixtures = {
	rbAPI: APIRequestContext;
};
const URL = config.RESTFUL_API_BASE_URL!;
const LOGIN_URL = URL + "/api/auth/login";
/** HTTP methods on APIRequestContext that accept a URL as the first argument */
const PROXIED_METHODS = [
	"get",
	"post",
	"put",
	"patch",
	"delete",
	"head",
] as const;

/**
 * Wraps an APIRequestContext so that any 401/403 response automatically
 * refreshes the token, recreates the context, and retries the call once.
 */
const createSelfHealingContext = (
	ctx: APIRequestContext,
	recreate: () => Promise<APIRequestContext>,
): APIRequestContext => {
	let currentCtx = ctx;

	return new Proxy(currentCtx, {
		get(target, prop: string) {
			const original = currentCtx[prop as keyof APIRequestContext];
			logger.debug(original.toString());
			if (!PROXIED_METHODS.includes(prop as (typeof PROXIED_METHODS)[number])) {
				return typeof original === "function"
					? // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
						(original as Function).bind(currentCtx)
					: original;
			}

			return async (...args: unknown[]): Promise<APIResponse> => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
				const method = currentCtx[prop as keyof APIRequestContext] as Function;
				const response: APIResponse = await method.apply(currentCtx, args);

				logger.debug("Status of the Request instance - " + response.status());

				if (response.status() === 401 || response.status() === 403) {
					logger.warn(
						`[rbAPI] ${response.status()} on ${prop.toUpperCase()} ${args[0]} — refreshing token...`,
					);
					await refreshToken(LOGIN_URL);
					currentCtx = await recreate();
					const retryMethod = currentCtx[
						prop as keyof APIRequestContext
						// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
					] as Function;
					return retryMethod.apply(currentCtx, args);
				}

				return response;
			};
		},
	}) as APIRequestContext;
};

export const apiTest = base.extend<AuthFixtures>({
	// eslint-disable-next-line no-empty-pattern
	rbAPI: async ({}, use) => {
		const makeContext = async () => {
			const token = await getToken(LOGIN_URL);
			return playwrightRequest.newContext({
				baseURL: config.RESTFUL_API_BASE_URL,
				extraHTTPHeaders: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Cookie: `token=${token}`,
				},
			});
		};

		const apiContext = await makeContext();
		const healingProxy = createSelfHealingContext(apiContext, makeContext);

		await use(healingProxy);
		await apiContext.dispose();
	},
});
