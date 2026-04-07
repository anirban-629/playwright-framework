import path from "node:path";
import type { LoggerOptions } from "winston";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logDir = path.join(process.cwd(), "logs");
export const LoggerSetup: LoggerOptions = {
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json(),
		winston.format.combine(
			winston.format.printf(({ timestamp, level, message }) => {
				return `${timestamp} [${level}]: ${message}`;
			}),
		),
	),

	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message, ...meta }) => {
					return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
						}`;
				}),
			),
		}),
		new DailyRotateFile({
			filename: path.join(logDir, `test-execution-%DATE%.log`),
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "14d",
			level: "info",
			auditFile: path.join(logDir, `test-execution-audit.json`),
		}),
	],
};
