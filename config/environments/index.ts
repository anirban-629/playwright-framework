// biome-ignore assist/source/organizeImports: <IMPORT SORT ERROR>
import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import type { IConfig } from "../../types";
import { QAConfig } from "./QA.config";
import { UATConfig } from "./UAT.config";

const ENV = process.env.ENV ?? "dev";
const RETRY = process.env.RETRY ? Number(process.env.RETRY) : 1;
const PARELLAL = (() => {
	const v = process.env.PARELLAL?.toLowerCase();
	return v === "true" || v === "1";
})();
const HEADLESS = (() => {
	const v = process.env.HEADLESS?.toLowerCase();
	return v === "true" || v === "1";
})();
const WORKERS = process.env.WORKERS ? Number(process.env.WORKERS) : 1;

const envSpecifiConfig: IConfig = ENV === "UAT" ? UATConfig : QAConfig;

export const config = {
	...envSpecifiConfig,
	ENV,
	PARELLAL,
	RETRY,
	HEADLESS,
	WORKERS,
};
