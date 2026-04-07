import type { IConfig } from "../../types";

import { FCConfig } from "./FC.config";
import { QAConfig } from "./QA.config";
import { UATConfig } from "./UAT.config";

const ENV = process.env.ENV || "DEV";

// export const config = configs[ENV as keyof typeof configs] || devConfig;
export const config: IConfig =
	ENV === "FC" ? FCConfig : ENV === "UAT" ? UATConfig : QAConfig;
