import { execSync } from "node:child_process";
import * as os from "node:os";
import type { OrtoniReportConfig } from "ortoni-report";

const gitUserName = execSync("git config user.name", {
	encoding: "utf8",
}).trim();

const timestamp = `${new Date().toLocaleString("en-US", { month: "short" })}, ${new Date().getFullYear()} ${new Date().toLocaleTimeString("en-US", { hour12: false })}`;

export const ortoniReportConfig: OrtoniReportConfig = {
	// open: process.env.CI ? "never" : "always",
	open: "never",
	folderPath: "./test-results",
	title: "Ortoni Test Report",
	filename: "playwright.html",
	projectName: "Playwright Boilerplate",
	testType: "Functional",
	authorName: gitUserName,
	base64Image: false,
	stdIO: false,
	meta: {
		"Test Cycle": timestamp,
		version: "4",
		description: `${process.env.SUITE_DESCRIPTION || "Automation suite"}`,
		release: "0.1",
		platform: os.type(),
	},
};
