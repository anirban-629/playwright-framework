import type { IConfig } from "../../types";

export const QAConfig: IConfig = {
	URL: process.env.QA_URL
		? String(process.env.QA_URL)
		: "https://demo.playwright.dev/todomvc",
	TIMEOUT: process.env.QA_SPECIFIED_TIMEOUT
		? Number(process.env.QA_SPECIFIED_TIMEOUT)
		: 60000,
};
