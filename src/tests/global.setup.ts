import { expect, test as setup } from "@playwright/test";
import { logger } from "../../config/logging";

setup("Initiating Test", async ({}, testInfo) => {
	logger.testStart(testInfo.title);
	expect(testInfo.title).toBeTruthy();
});
