import {
	APIRequestContext,
	test as base,
	request as playwrightRequest,
} from "@playwright/test";
import { config } from "../../config/environments";
import { getToken } from "../utils/helpers/token.store";
import { createSelfHealingContext } from "../utils/helpers/apiProxy";

type AuthFixtures = {
	rbAPI: APIRequestContext;
};
const URL = config.RESTFUL_API_BASE_URL!;
const AUTH_URL = URL + "/api/auth/login";

/** HTTP methods on APIRequestContext that accept a URL as the first argument */
export const apiTest = base.extend<AuthFixtures>({
	// eslint-disable-next-line no-empty-pattern
	rbAPI: async ({}, use) => {
		const makeContext = async () => {
			const token = await getToken(AUTH_URL);
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
		const healingProxy = createSelfHealingContext(
			AUTH_URL,
			apiContext,
			makeContext,
		);

		await use(healingProxy);
		await apiContext.dispose();
	},
});
