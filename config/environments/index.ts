// biome-ignore assist/source/organizeImports: <IMPORT SORT ERROR>
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import type { IConfig } from "../../types";
import { QAConfig } from "./QA.config";
import { UATConfig } from "./UAT.config";
import { logger } from "../logging";

const parseBooleanEnv = (value: string | undefined): boolean => {
	const v = value?.toLowerCase();
	return v === "true" || v === "1";
};

const requiredEnvVars: string[] = [
	"ENV",
	"PARELLAL",
	"HEADLESS",
	"RETRY",
	"WORKERS",
	"URL",
];

const missing = requiredEnvVars.filter((key) => !process.env[key]);

if (missing.length > 0) {
	logger.error("\nMissing required environment variables:\n");
	missing.forEach((key) => {
		console.error(`   - ${key}`);
	});
	logger.error("\nMake sure your .env file is set up correctly.\n");
	process.exit(1);
}
logger.info("All required environment variables are present.");

const ENV = process.env.ENV ?? "dev";
const RETRY = process.env.RETRY ? Number(process.env.RETRY) : 1;
const PARALLEL = parseBooleanEnv(process.env.PARALLEL);
const HEADLESS = parseBooleanEnv(process.env.HEADLESS);
const WORKERS = process.env.WORKERS ? Number(process.env.WORKERS) : 1;

const envSpecificConfig: IConfig = ENV === "UAT" ? UATConfig : QAConfig;

export const config = {
	...envSpecificConfig,
	ENV,
	PARALLEL,
	RETRY,
	HEADLESS,
	WORKERS,
};
