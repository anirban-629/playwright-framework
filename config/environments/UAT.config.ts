import type { IConfig } from "../../types";

export const UATConfig: IConfig = {
	URL: process.env.UAT_URL
		? String(process.env.UAT_URL)
		: "https://demo.playwright.dev/todomvc",
	TIMEOUT: process.env.UAT_SPECIFIED_TIMEOUT
		? Number(process.env.UAT_SPECIFIED_TIMEOUT)
		: 60000,
};
