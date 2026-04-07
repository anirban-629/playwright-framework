import type { IAPIResponse } from "../../types";

/** Static class used to connect to Salesforce instance. */
export class JSFConnector {
	private URL: string;
	private clientId: string;
	private clientSecret: string;
	protected APIResponse: IAPIResponse;
	protected ACCESS_TOKEN: string;

	constructor() {
		this.URL =
			"https://brave-fox-1zv5xs-dev-ed.trailblaze.my.salesforce.com/services/oauth2/token";
		this.clientId =
			"3MVG9VMBZCsTL9hnaVq34u3M44dO.ag6ne5nTK9cB0LKrXV1HchgfdRcN0exZcdAVHFhCvIBLXVnRrW9M3j.Q";
		this.clientSecret =
			"35073DC363B11A1AFD2E4CD80C49204BA1F6C64A5728A573998701254598D6BF";
	}
	async establishConnection() {
		const params = new URLSearchParams();
		params.append("grant_type", "client_credentials");
		params.append("client_id", this.clientId);
		params.append("client_secret", this.clientSecret);
		const res = await fetch(this.URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params,
		});
		if (!res.ok) {
			const text = await res.text();
			console.error(`Token request failed (${res.status}): ${text}`);
			process.exit(0);
		}
		this.APIResponse = await res.json();
		this.ACCESS_TOKEN = this.APIResponse.access_token;
		return this.APIResponse;
	}
}
