import fs from "node:fs";
import path from "node:path";

const dirs: string[] = [
	"allure-results",
	"allure-report",
	"test-results",
	"ortoni-report",
	"custom-report",
	"playwright-report",
	"auth-sessions",
];

const logsDir = "logs";

dirs.forEach((dir) => {
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, { recursive: true, force: true });
		console.log(`🗑  Removed: ${dir}`);
	} else {
		console.log(`⏭  Skipped (not found): ${dir}`);
	}
});

if (fs.existsSync(logsDir)) {
	const logFiles = fs.readdirSync(logsDir).filter((f) => f.endsWith(".log"));

	if (logFiles.length > 0) {
		logFiles.forEach((file) => {
			fs.unlinkSync(path.join(logsDir, file));
			console.log(`🗑  Removed: logs/${file}`);
		});
	} else {
		console.log("⏭  Skipped: no .log files found");
	}
} else {
	console.log("⏭  Skipped: logs/ directory not found");
}

console.log("\n✅ Clean complete");
