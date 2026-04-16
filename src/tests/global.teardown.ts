import { expect, test as teardown } from "@playwright/test";
import { logger } from "../../config/logging";

teardown("End of Test Case", async ({}, testInfo) => {
	logger.testEnd(testInfo.title, testInfo.status ? "PASSED" : "FAILED");
	expect(testInfo.title).toBeTruthy();
});
