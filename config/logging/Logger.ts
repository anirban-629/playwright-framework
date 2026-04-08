import winston from "winston";
import { LoggerSetup } from "./LogManager";

class Logger {
	private logger: winston.Logger;

	constructor() {
		this.logger = winston.createLogger(LoggerSetup);
	}

	info(message: string): void {
		this.logger.info(message);
	}

	error(message: string): void {
		this.logger.error(message);
	}

	warn(message: string): void {
		this.logger.warn(message);
	}

	debug(message: string): void {
		this.logger.debug(message);
	}

	step(message: string): void {
		this.logger.info(`[STEP]: ${message}`);
	}

	testStart(testName: string): void {
		this.logger.info(`${"=".repeat(50)}`);
		this.logger.info(`[TEST STARTED]: ${testName}`);
	}

	testEnd(testName: string, status: "PASSED" | "FAILED"): void {
		this.logger.info(`[TEST ${status}]: ${testName}`);
		this.logger.info(`${"=".repeat(50)}`);
	}
	setup(msg: string): void {
		this.logger.warn(`${"#".repeat(50)}`);
		this.logger.warn(`${msg}`);
		this.logger.warn(`${"#".repeat(50)}`);
	}

	teardown(msg: string): void {
		this.logger.warn(`${"#".repeat(50)}`);
		this.logger.warn(`${msg}`);
		this.logger.warn(`${"#".repeat(50)}`);
	}
}

export const logger = new Logger();
