import { APIRequestContext, APIResponse } from "@playwright/test";
import { logger } from "../../../config/logging";
import { refreshToken } from "./token.store";

export const PROXIED_METHODS = [
	"get",
	"post",
	"put",
	"patch",
	"delete",
	"head",
] as const;

/**
 * Creates a self-healing wrapper around a Playwright APIRequestContext.
 *
 * This proxy intercepts the standard HTTP methods listed in PROXIED_METHODS.
 * When a request returns a 401 or 403 response, it:
 *   1. refreshes the auth token by calling refreshToken(AUTH_URL)
 *   2. recreates the APIRequestContext using the provided recreate() callback
 *   3. retries the original request once with the new context
 *
 * The wrapper keeps the current context in sync so subsequent requests use
 * the refreshed credentials automatically.
 *
 * @param AUTH_URL - endpoint used by refreshToken() to obtain a new token
 * @param ctx - initial Playwright APIRequestContext to wrap
 * @param recreate - async callback that returns a new APIRequestContext after token refresh
 * @returns an APIRequestContext proxy that transparently retries unauthorized requests once
 */

export const createSelfHealingContext = (
	AUTH_URL: string,
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
					await refreshToken(AUTH_URL);
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
