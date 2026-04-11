// biome-ignore assist/source/organizeImports: <IMPORT SORT ERROR>
import dotenv from "dotenv";
import path from "node:path";

if (!process.env.CI || Boolean(process.env.CI) !== true) {
	dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

import type { IConfig } from "../../types";
import { QAConfig } from "./QA.config";
import { UATConfig } from "./UAT.config";
import { logger } from "../logging";
import { REQUIRED_ENVS } from "../../src/constants";

const parseBooleanEnv = (value: string | undefined): boolean => {
	const v = value?.toLowerCase();
	return v === "true" || v === "1";
};

const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);

if (missing.length > 0) {
	logger.error("Missing required environment variables:");
	missing.forEach((key) => {
		console.error(`   - ${key}`);
	});
	logger.error("Make sure your .env file is set up correctly.");
	process.exit(1);
}
logger.info("All required environment variables are present.");

const ENV = process.env.ENV;
const RETRY = Number(process.env.RETRY);
const PARALLEL = parseBooleanEnv(process.env.PARALLEL);
const HEADLESS = parseBooleanEnv(process.env.HEADLESS);
const WORKERS = Number(process.env.WORKERS);
const TEST_TIMEOUT = Number(process.env.TEST_TIMEOUT);
const EXPECT_TIMEOUT = Number(process.env.EXPECT_TIMEOUT);
const ACTION_TIMEOUT = Number(process.env.ACTION_TIMEOUT);
const NAV_TIMEOUT = Number(process.env.NAV_TIMEOUT);

const envSpecificConfig: IConfig = ENV === "UAT" ? UATConfig : QAConfig;

export const config = {
	...envSpecificConfig,
	ENV,
	PARALLEL,
	RETRY,
	HEADLESS,
	WORKERS,
	TEST_TIMEOUT,
	EXPECT_TIMEOUT,
	ACTION_TIMEOUT,
	NAV_TIMEOUT,
};
