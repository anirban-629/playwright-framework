import type {
	Reporter,
	Suite,
	TestCase,
	TestResult,
	TestStep,
} from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

export interface SingleHtmlReporterOptions {
	outputFile?: string;
	title?: string;
}

interface StepData {
	title: string;
	status: "passed" | "failed" | "skipped" | string;
	duration: number;
	error?: string;
	category: string;
}

interface ScreenshotData {
	name: string;
	base64: string;
}

interface TestData {
	title: string;
	fullTitle: string;
	status: "passed" | "failed" | "skipped" | "timedOut" | string;
	duration: number;
	steps: StepData[];
	error?: string;
	retry: number;
	screenshots: ScreenshotData[];
}

interface SuiteData {
	title: string;
	tests: TestData[];
}

class SingleHtmlReporter implements Reporter {
	private options: SingleHtmlReporterOptions;
	private suites: SuiteData[] = [];
	private startTime: number = Date.now();

	constructor(options: SingleHtmlReporterOptions = {}) {
		this.options = {
			outputFile: options.outputFile ?? "test-report.html",
			title: options.title ?? "Test Report",
		};
	}

	onBegin(_config: unknown, suite: Suite): void {
		this.startTime = Date.now();
		this.collectSuites(suite);
	}

	private collectSuites(suite: Suite): void {
		for (const child of suite.suites) {
			if (child.tests.length > 0) {
				this.suites.push({ title: child.title || "Root Suite", tests: [] });
			}
			this.collectSuites(child);
		}
	}

	onTestEnd(test: TestCase, result: TestResult): void {
		const steps = this.collectSteps(result.steps);

		const screenshots: ScreenshotData[] = [];
		if (result.status === "failed" || result.status === "timedOut") {
			for (const attachment of result.attachments) {
				if (attachment.contentType === "image/png" && attachment.body) {
					screenshots.push({
						name: attachment.name,
						base64: attachment.body.toString("base64"),
					});
				} else if (
					attachment.contentType === "image/png" &&
					attachment.path &&
					fs.existsSync(attachment.path)
				) {
					const buffer = fs.readFileSync(attachment.path);
					screenshots.push({
						name: attachment.name,
						base64: buffer.toString("base64"),
					});
				}
			}
		}

		const testData: TestData = {
			title: test.title,
			fullTitle: test.titlePath().join(" › "),
			status: result.status,
			duration: result.duration,
			retry: result.retry,
			steps,
			screenshots,
			error: result.error?.message
				? this.stripAnsi(result.error.message)
				: undefined,
		};

		const suitePath = test.titlePath().slice(0, -1).join(" › ");
		let suite = this.suites.find((s) => s.title === suitePath);
		if (!suite) {
			suite = { title: suitePath, tests: [] };
			this.suites.push(suite);
		}
		suite.tests.push(testData);
	}

	private collectSteps(steps: TestStep[], depth: number = 0): StepData[] {
		const result: StepData[] = [];
		for (const step of steps) {
			if (
				step.category === "pw:api" ||
				step.category === "test.step" ||
				step.category === "expect"
			) {
				result.push({
					title: "  ".repeat(depth) + step.title,
					status: step.error ? "failed" : "passed",
					duration: step.duration,
					error: step.error?.message
						? this.stripAnsi(step.error.message)
						: undefined,
					category: step.category,
				});
			}
			if (step.steps?.length)
				result.push(...this.collectSteps(step.steps, depth + 1));
		}
		return result;
	}

	private stripAnsi(str: string): string {
		// biome-ignore lint/suspicious/noControlCharactersInRegex: <  >
		return str.replace(/\x1b\[[0-9;]*m/g, "");
	}

	onEnd(): void {
		const totalDuration = Date.now() - this.startTime;
		const allTests = this.suites.flatMap((s) => s.tests);
		const passed = allTests.filter((t) => t.status === "passed").length;
		const failed = allTests.filter((t) => t.status === "failed").length;
		const skipped = allTests.filter((t) => t.status === "skipped").length;
		const total = allTests.length;

		const html = this.generateHtml({
			passed,
			failed,
			skipped,
			total,
			totalDuration,
		});

		// biome-ignore lint/style/noNonNullAssertion: < >
		const outputPath = path.resolve(this.options.outputFile!);
		fs.mkdirSync(path.dirname(outputPath), { recursive: true });
		fs.writeFileSync(outputPath, html, "utf-8");
		console.log(`\n📄 Single HTML report saved to: ${outputPath}\n`);
	}

	private formatDuration(ms: number): string {
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	}

	private getCategoryIcon(category: string): string {
		if (category === "expect") return "◈";
		if (category === "test.step") return "▶";
		return "·";
	}

	private escapeHtml(str: string): string {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	private generateTestsHtml(): string {
		return this.suites
			.map((suite) => {
				if (!suite.tests.length) return "";

				const testsHtml = suite.tests
					.map((test, testIdx) => {
						const statusClass =
							test.status === "passed"
								? "passed"
								: test.status === "failed"
									? "failed"
									: "skipped";
						const statusIcon =
							test.status === "passed"
								? "✓"
								: test.status === "failed"
									? "✗"
									: "○";

						const stepsHtml = test.steps.length
							? test.steps
									.map((step) => {
										const icon = this.getCategoryIcon(step.category);
										const stepClass =
											step.status === "failed" ? "step-failed" : "";
										return `
                  <div class="step ${stepClass}">
                    <span class="step-icon">${icon}</span>
                    <span class="step-title">${this.escapeHtml(step.title)}</span>
                    <span class="step-duration">${this.formatDuration(step.duration)}</span>
                    ${step.error ? `<div class="step-error">${this.escapeHtml(step.error)}</div>` : ""}
                  </div>`;
									})
									.join("")
							: '<div class="no-steps">No steps recorded</div>';

						const retryBadge =
							test.retry > 0
								? `<span class="retry-badge">Retry #${test.retry}</span>`
								: "";

						const screenshotsHtml =
							test.screenshots.length > 0
								? `<div class="screenshots-section">
                    <div class="screenshots-label">📷 &nbsp;Failure Screenshots</div>
                    <div class="screenshots-grid">
                      ${test.screenshots
												.map(
													(s, i) => `
                        <div class="screenshot-card">
                          <div class="screenshot-name">${this.escapeHtml(s.name)}</div>
                          <img
                            class="screenshot-img"
                            src="data:image/png;base64,${s.base64}"
                            alt="${this.escapeHtml(s.name)}"
                            onclick="openLightbox('lb-${testIdx}-${i}')"
                          />
                        </div>
                        <div class="lightbox" id="lb-${testIdx}-${i}" onclick="closeLightbox(this)">
                          <div class="lightbox-inner" onclick="event.stopPropagation()">
                            <button class="lb-close" onclick="closeLightbox(document.getElementById('lb-${testIdx}-${i}'))">✕</button>
                            <img src="data:image/png;base64,${s.base64}" alt="${this.escapeHtml(s.name)}" />
                            <div class="lb-caption">${this.escapeHtml(s.name)}</div>
                          </div>
                        </div>`,
												)
												.join("")}
                    </div>
                  </div>`
								: "";

						return `
            <div class="test ${statusClass}">
              <div class="test-header" onclick="toggleTest(this)">
                <span class="status-pill ${statusClass}">${statusIcon} ${statusClass.toUpperCase()}</span>
                <span class="test-title">${this.escapeHtml(test.title)}</span>
                ${retryBadge}
                <span class="test-duration">${this.formatDuration(test.duration)}</span>
                <span class="chevron">›</span>
              </div>
              <div class="test-body">
                <div class="steps-container">${stepsHtml}</div>
                ${
									test.error
										? `<div class="error-block">
                      <span class="error-label">Error</span>
                      <pre>${this.escapeHtml(test.error)}</pre>
                    </div>`
										: ""
								}
                ${screenshotsHtml}
              </div>
            </div>`;
					})
					.join("");

				const suitePass = suite.tests.filter(
					(t) => t.status === "passed",
				).length;
				const suiteFail = suite.tests.filter(
					(t) => t.status === "failed",
				).length;

				return `
        <div class="suite">
          <div class="suite-header">
            <span class="suite-title">${this.escapeHtml(suite.title)}</span>
            <span class="suite-stats">
              ${suitePass > 0 ? `<span class="stat-pass">✓ ${suitePass} passed</span>` : ""}
              ${suiteFail > 0 ? `<span class="stat-fail">✗ ${suiteFail} failed</span>` : ""}
            </span>
          </div>
          ${testsHtml}
        </div>`;
			})
			.join("");
	}

	private generateHtml(summary: {
		passed: number;
		failed: number;
		skipped: number;
		total: number;
		totalDuration: number;
	}): string {
		const passRate =
			summary.total > 0
				? Math.round((summary.passed / summary.total) * 100)
				: 0;
		const overallStatus = summary.failed > 0 ? "FAILED" : "PASSED";
		const now = new Date().toLocaleString();

		return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${
			// biome-ignore lint/style/noNonNullAssertion: < >
			this.escapeHtml(this.options.title!)
		}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0b0d12; --surface: #11141c; --surface2: #181c27; --surface3: #1e2230;
    --border: #1f2333; --border2: #2a2f45;
    --pass: #34d399; --pass-dim: #0d2b1f; --pass-glow: rgba(52,211,153,0.15);
    --fail: #f87171; --fail-dim: #2b0d0d; --fail-glow: rgba(248,113,113,0.15);
    --skip: #94a3b8; --skip-dim: #1e2333;
    --accent: #818cf8; --accent2: #6366f1;
    --text: #e2e8f0; --text-dim: #64748b; --text-mid: #94a3b8;
    --mono: 'JetBrains Mono', monospace; --sans: 'Syne', sans-serif; --radius: 8px;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--mono); font-size: 13px; line-height: 1.6; min-height: 100vh; }

  /* HEADER */
  .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 22px 40px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .header-brand { display: flex; align-items: center; gap: 14px; }
  .brand-icon { width: 36px; height: 36px; background: linear-gradient(135deg, var(--accent2), var(--accent)); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .header-left h1 { font-family: var(--sans); font-size: 18px; font-weight: 800; letter-spacing: -0.3px; }
  .run-meta { color: var(--text-dim); font-size: 11px; margin-top: 2px; }
  .overall-badge { font-family: var(--sans); font-weight: 700; font-size: 11px; letter-spacing: 2px; padding: 7px 18px; border-radius: 6px; text-transform: uppercase; }
  .overall-badge.PASSED { background: var(--pass-dim); color: var(--pass); border: 1px solid rgba(52,211,153,0.3); box-shadow: 0 0 16px var(--pass-glow); }
  .overall-badge.FAILED { background: var(--fail-dim); color: var(--fail); border: 1px solid rgba(248,113,113,0.3); box-shadow: 0 0 16px var(--fail-glow); }

  /* SUMMARY */
  .summary-section { background: var(--surface); border-bottom: 1px solid var(--border); padding: 22px 40px; }
  .summary-cards { display: flex; gap: 12px; flex-wrap: wrap; }
  .summary-card { flex: 1; min-width: 100px; background: var(--surface2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; position: relative; overflow: hidden; }
  .summary-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; }
  .card-total::before { background: var(--accent); }
  .card-pass::before { background: var(--pass); }
  .card-fail::before { background: var(--fail); }
  .card-skip::before { background: var(--skip); }
  .card-rate::before { background: linear-gradient(90deg, var(--accent2), var(--pass)); }
  .card-value { font-family: var(--sans); font-size: 30px; font-weight: 800; line-height: 1; margin-bottom: 4px; }
  .card-total .card-value { color: var(--text); }
  .card-pass .card-value { color: var(--pass); }
  .card-fail .card-value { color: var(--fail); }
  .card-skip .card-value { color: var(--skip); }
  .card-rate .card-value { color: var(--accent); }
  .card-label { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim); }
  .progress-wrap { margin-top: 18px; display: flex; align-items: center; gap: 14px; }
  .progress-track { flex: 1; height: 6px; background: var(--border2); border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; background: ${summary.failed > 0 ? "linear-gradient(90deg,#7f1d1d,var(--fail))" : "linear-gradient(90deg,var(--accent2),var(--pass))"}; width: ${passRate}%; box-shadow: ${summary.failed > 0 ? "0 0 8px rgba(248,113,113,0.4)" : "0 0 8px rgba(52,211,153,0.4)"}; }
  .progress-label { font-family: var(--sans); font-size: 13px; font-weight: 700; color: ${summary.failed > 0 ? "var(--fail)" : "var(--pass)"}; min-width: 42px; text-align: right; }

  /* FILTER BAR */
  .filter-bar { padding: 14px 40px; display: flex; gap: 8px; align-items: center; border-bottom: 1px solid var(--border); background: var(--bg); position: sticky; top: 81px; z-index: 50; }
  .filter-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--text-dim); margin-right: 4px; }
  .filter-btn { font-family: var(--mono); font-size: 11px; padding: 5px 14px; border-radius: 99px; border: 1px solid var(--border2); background: var(--surface2); color: var(--text-mid); cursor: pointer; transition: all 0.15s; }
  .filter-btn:hover { border-color: var(--accent); color: var(--accent); }
  .filter-btn.active { background: var(--accent2); border-color: var(--accent2); color: #fff; }
  .filter-btn.active-pass { background: var(--pass-dim); border-color: var(--pass); color: var(--pass); }
  .filter-btn.active-fail { background: var(--fail-dim); border-color: var(--fail); color: var(--fail); }

  /* CONTENT */
  .content { padding: 28px 40px; max-width: 1100px; margin: 0 auto; }
  .suite { margin-bottom: 28px; }
  .suite-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 0 10px; border-bottom: 1px solid var(--border); margin-bottom: 10px; }
  .suite-title { font-family: var(--sans); font-size: 11px; font-weight: 600; color: var(--text-dim); letter-spacing: 1.5px; text-transform: uppercase; }
  .suite-stats { display: flex; gap: 12px; font-size: 11px; }
  .stat-pass { color: var(--pass); }
  .stat-fail { color: var(--fail); }

  /* TEST CARD */
  .test { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 8px; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
  .test:hover { border-color: var(--border2); }
  .test.passed { border-left: 3px solid var(--pass); }
  .test.failed { border-left: 3px solid var(--fail); box-shadow: 0 0 0 1px rgba(248,113,113,0.06), 0 2px 12px rgba(248,113,113,0.05); }
  .test.skipped { border-left: 3px solid var(--skip); }
  .test-header { display: flex; align-items: center; gap: 12px; padding: 13px 18px; cursor: pointer; user-select: none; transition: background 0.15s; }
  .test-header:hover { background: var(--surface2); }
  .status-pill { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 3px 10px; border-radius: 99px; flex-shrink: 0; }
  .status-pill.passed { background: var(--pass-dim); color: var(--pass); border: 1px solid rgba(52,211,153,0.2); }
  .status-pill.failed { background: var(--fail-dim); color: var(--fail); border: 1px solid rgba(248,113,113,0.2); }
  .status-pill.skipped { background: var(--skip-dim); color: var(--skip); border: 1px solid rgba(148,163,184,0.2); }
  .test-title { flex: 1; font-size: 13px; color: var(--text); }
  .test-duration { color: var(--text-dim); font-size: 11px; flex-shrink: 0; background: var(--surface2); padding: 2px 8px; border-radius: 4px; }
  .chevron { color: var(--text-dim); font-size: 18px; transition: transform 0.2s; flex-shrink: 0; }
  .test-header.open .chevron { transform: rotate(90deg); }
  .test-body { display: none; border-top: 1px solid var(--border); background: var(--bg); }
  .test-body.open { display: block; }

  /* STEPS */
  .steps-container { padding: 14px 18px; display: flex; flex-direction: column; gap: 1px; }
  .step { display: grid; grid-template-columns: 16px 1fr auto; align-items: baseline; gap: 8px; padding: 5px 10px; border-radius: 5px; font-size: 12px; transition: background 0.15s; }
  .step:hover { background: var(--surface2); }
  .step.step-failed { background: var(--fail-dim); }
  .step-icon { color: var(--text-dim); font-size: 10px; text-align: center; }
  .step-title { color: var(--text-mid); white-space: pre; }
  .step-failed .step-title { color: var(--fail); }
  .step-duration { color: var(--text-dim); font-size: 10px; }
  .step-error { grid-column: 2 / -1; font-size: 11px; color: var(--fail); margin-top: 4px; padding: 8px 12px; background: rgba(248,113,113,0.08); border-left: 2px solid var(--fail); border-radius: 0 4px 4px 0; }

  /* ERROR BLOCK */
  .error-block { margin: 0 18px 16px; border: 1px solid rgba(248,113,113,0.2); border-radius: var(--radius); overflow: hidden; }
  .error-label { display: block; background: var(--fail-dim); color: var(--fail); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-bottom: 1px solid rgba(248,113,113,0.15); }
  .error-block pre { padding: 14px; font-size: 11px; color: #fca5a5; white-space: pre-wrap; word-break: break-word; background: rgba(248,113,113,0.04); line-height: 1.7; }

  /* SCREENSHOTS */
  .screenshots-section { margin: 0 18px 18px; border: 1px solid rgba(248,113,113,0.15); border-radius: var(--radius); overflow: hidden; }
  .screenshots-label { background: var(--fail-dim); color: var(--fail); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; padding: 7px 14px; border-bottom: 1px solid rgba(248,113,113,0.15); }
  .screenshots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; padding: 14px; }
  .screenshot-card { border: 1px solid var(--border2); border-radius: 6px; overflow: hidden; background: var(--surface2); }
  .screenshot-name { padding: 6px 10px; font-size: 10px; color: var(--text-dim); background: var(--surface3); border-bottom: 1px solid var(--border); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .screenshot-img { width: 100%; display: block; cursor: zoom-in; transition: opacity 0.15s; max-height: 180px; object-fit: cover; }
  .screenshot-img:hover { opacity: 0.82; }

  /* LIGHTBOX */
  .lightbox { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(6px); padding: 20px; }
  .lightbox.open { display: flex; }
  .lightbox-inner { position: relative; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .lightbox-inner img { max-width: 100%; max-height: 80vh; border-radius: 8px; border: 1px solid var(--border2); box-shadow: 0 0 60px rgba(0,0,0,0.8); }
  .lb-caption { color: var(--text-dim); font-size: 11px; }
  .lb-close { position: absolute; top: -14px; right: -14px; width: 32px; height: 32px; background: var(--surface3); border: 1px solid var(--border2); border-radius: 50%; color: var(--text); font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; z-index: 10; }
  .lb-close:hover { background: var(--fail-dim); color: var(--fail); }

  /* MISC */
  .retry-badge { background: rgba(234,179,8,0.1); color: #eab308; font-size: 10px; padding: 2px 8px; border-radius: 99px; border: 1px solid rgba(234,179,8,0.25); flex-shrink: 0; }
  .no-steps { color: var(--text-dim); font-size: 11px; font-style: italic; padding: 6px 10px; }
  .footer { text-align: center; padding: 28px; color: var(--text-dim); font-size: 11px; border-top: 1px solid var(--border); margin-top: 40px; letter-spacing: 0.5px; }

  @media (max-width: 600px) {
    .header, .summary-section, .content, .filter-bar { padding-left: 16px; padding-right: 16px; }
    .card-value { font-size: 24px; }
    .filter-bar { top: 78px; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-brand">
    <div class="brand-icon">🎭</div>
    <div class="header-left">
    
      <h1>${
				// biome-ignore lint/style/noNonNullAssertion: < >
				this.escapeHtml(this.options.title!)
			}</h1>
      <div class="run-meta">Generated ${now} · Duration: ${this.formatDuration(summary.totalDuration)}</div>
    </div>
  </div>
  <div class="overall-badge ${overallStatus}">${overallStatus === "PASSED" ? "✓" : "✗"} &nbsp;${overallStatus}</div>
</div>

<div class="summary-section">
  <div class="summary-cards">
    <div class="summary-card card-total"><div class="card-value">${summary.total}</div><div class="card-label">Total Tests</div></div>
    <div class="summary-card card-pass"><div class="card-value">${summary.passed}</div><div class="card-label">Passed</div></div>
    <div class="summary-card card-fail"><div class="card-value">${summary.failed}</div><div class="card-label">Failed</div></div>
    <div class="summary-card card-skip"><div class="card-value">${summary.skipped}</div><div class="card-label">Skipped</div></div>
    <div class="summary-card card-rate"><div class="card-value">${passRate}%</div><div class="card-label">Pass Rate</div></div>
  </div>
  <div class="progress-wrap">
    <div class="progress-track"><div class="progress-fill"></div></div>
    <div class="progress-label">${passRate}%</div>
  </div>
</div>

<div class="filter-bar">
  <span class="filter-label">Filter</span>
  <button class="filter-btn active" id="btn-all" onclick="filterTests('all')">All (${summary.total})</button>
  <button class="filter-btn" id="btn-passed" onclick="filterTests('passed')">✓ Passed (${summary.passed})</button>
  <button class="filter-btn" id="btn-failed" onclick="filterTests('failed')">✗ Failed (${summary.failed})</button>
  ${summary.skipped > 0 ? `<button class="filter-btn" id="btn-skipped" onclick="filterTests('skipped')">○ Skipped (${summary.skipped})</button>` : ""}
</div>

<div class="content">
  ${this.generateTestsHtml()}
</div>

<div class="footer">Playwright · Single HTML Reporter · ${now}</div>

<script>
  function toggleTest(header) {
    header.classList.toggle('open');
    header.nextElementSibling.classList.toggle('open');
  }

  function filterTests(type) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active','active-pass','active-fail'));
    const btn = document.getElementById('btn-' + type);
    if (type === 'all') btn.classList.add('active');
    else if (type === 'passed') btn.classList.add('active-pass');
    else if (type === 'failed') btn.classList.add('active-fail');
    else btn.classList.add('active');

    document.querySelectorAll('.test').forEach(t => {
      t.style.display = (type === 'all' || t.classList.contains(type)) ? '' : 'none';
    });

    document.querySelectorAll('.suite').forEach(s => {
      const visible = [...s.querySelectorAll('.test')].some(t => t.style.display !== 'none');
      s.style.display = visible ? '' : 'none';
    });
  }

  function openLightbox(id) {
    document.getElementById(id).classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.lightbox.open').forEach(lb => lb.classList.remove('open'));
      document.body.style.overflow = '';
    }
  });

  // Auto-expand failed tests on load
  document.querySelectorAll('.test.failed .test-header').forEach(h => {
    h.classList.add('open');
    h.nextElementSibling.classList.add('open');
  });
</script>
</body>
</html>`;
	}
}

export default SingleHtmlReporter;
