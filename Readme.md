# Playwright Framework (playwright-fmwrk)

A robust Playwright-based testing framework for web application automation and end-to-end testing, designed for learning and professional use.

## Description

This framework provides a structured approach to writing and executing Playwright tests with support for multiple environments, comprehensive logging, and advanced reporting capabilities. It includes example test suites for TodoMVC application and UI basics.

## Features

- **Multi-Environment Support**: Configure tests for QA, UAT, and production environments
- **Parallel Execution**: Run tests in parallel across multiple workers
- **Comprehensive Reporting**: Integrated with Allure, Ortoni, and custom HTML reports
- **Logging**: Winston-based logging with test execution tracking
- **TypeScript Support**: Full TypeScript configuration with type checking
- **Page Object Model**: Organized page objects and fixtures for maintainable tests
- **CI/CD Ready**: Configured for continuous integration with retry mechanisms

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd pl-learning
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (optional):
   Create a `.env` file in the root directory with your configuration.

## Usage

### Running Tests

Run all tests:

```bash
npm test
```

Run tests in specific environment:

```bash
npm run test:dev      # Development
npm run test:staging  # Staging
npm run test:prod     # Production
```

Run tests in headed mode (visible browser):

```bash
npm run test:headed
```

Debug tests:

```bash
npm run test:debug
```

Run tests with UI mode:

```bash
npm run test:ui
```

Run tests with specific tags:

```bash
npm run test:tag "@tagname"
```

### Test Suites

- **TodoMVC Tests**: Comprehensive tests for TodoMVC application functionality
- **UI Basics Tests**: Fundamental UI interaction tests covering forms, dropdowns, and navigation

## Configuration

### Environment Configuration

Configure test environments in `config/environments/`:

- `QA.config.ts`: QA environment settings
- `UAT.config.ts`: UAT environment settings

### Playwright Configuration

Main configuration in `playwright.config.ts`:

- Test directory: `./src/tests`
- Browsers: Chromium (configurable)
- Parallel execution settings
- Screenshot and video capture options

## Reporting

### View Reports

HTML Report:

```bash
npm run report:html
```

Allure Report:

```bash
npm run report:allure
```

Ortoni Report:

```bash
npm run report:ortoni
```

## Development

### Code Quality

Type checking:

```bash
npm run typecheck
```

Linting and formatting:

```bash
npm run lint
```

Clean build artifacts:

```bash
npm run clean
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks to ensure code quality.

## Project Structure

```
├── config/                 # Configuration files
│   ├── environments/       # Environment-specific configs
│   ├── logging/           # Logging setup
│   └── report/            # Report configurations
├── src/
│   ├── constants/         # Test constants
│   ├── fixtures/          # Test fixtures
│   ├── pages/             # Page object models
│   ├── tests/             # Test files
│   └── utils/             # Utility functions
├── reporters/             # Custom reporters
├── scripts/               # Build and utility scripts
└── types/                 # TypeScript type definitions
```

## Contributing

### Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

| Type       | Meaning                                             |
| ---------- | --------------------------------------------------- |
| `FEAT`     | New feature added                                   |
| `FIX`      | Bug fix                                             |
| `PERF`     | Performance improvement                             |
| `DOCS`     | Documentation only changes                          |
| `STYLE`    | Formatting and style (no functional change)         |
| `REFACTOR` | Code changes without adding features or fixing bugs |
| `TEST`     | Adding or updating tests                            |
| `BUILD`    | Build or tooling related                            |
| `CI`       | CI configuration changes                            |
| `CHORE`    | Misc maintenance tasks                              |
| `DEPS`     | Dependency updates                                  |

Before committing, run:

```bash
npm run commit
```

# Playwright Timeouts Guide

Playwright provides multiple levels of timeout control to handle different scenarios in your test suite. These can all be configured centrally in `playwright.config.ts`, and overridden per-test or per-action as needed.

---

## Types of Timeouts

### 1. Test Timeout

Limits how long a **single test** is allowed to run end-to-end.

```typescript
// playwright.config.ts
export default defineConfig({
	timeout: 60_000, // 60 seconds
});

// Override per test
test("slow test", async ({ page }) => {
	test.setTimeout(120_000);
});
```

---

### 2. Action Timeout

Controls how long individual actions like `click()`, `fill()`, `hover()` wait before failing.

```typescript
// playwright.config.ts
export default defineConfig({
	use: {
		actionTimeout: 15_000, // 15 seconds
	},
});

// Override per action
await page.click("#btn", { timeout: 30_000 });
```

---

### 3. Navigation Timeout

Controls how long `page.goto()` and `waitForNavigation()` wait for a page to load.

```typescript
// playwright.config.ts
export default defineConfig({
	use: {
		navigationTimeout: 30_000, // 30 seconds
	},
});

// Override per navigation
await page.goto("https://example.com", { timeout: 60_000 });
```

---

### 4. Expect (Assertion) Timeout

Defines how long assertions like `expect(locator).toBeVisible()` keep retrying before failing.

```typescript
// playwright.config.ts
export default defineConfig({
	expect: {
		timeout: 10_000, // 10 seconds
	},
});

// Override per assertion
await expect(page.locator(".msg")).toBeVisible({ timeout: 5_000 });
```

---

### 5. Global Timeout

Caps the **total execution time** for the entire test suite combined.

```typescript
// playwright.config.ts
export default defineConfig({
	globalTimeout: 600_000, // 10 minutes
});
```

---

### 6. waitForTimeout (Explicit Wait)

A hard pause. Use sparingly — only when no smart wait applies (e.g., animations).

```typescript
await page.waitForTimeout(2000); // waits exactly 2 seconds
```

---

## Full playwright.config.ts Example

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	timeout: Number(process.env.PW_TEST_TIMEOUT) || 60_000,
	globalTimeout: Number(process.env.PW_GLOBAL_TIMEOUT) || 600_000,

	expect: {
		timeout: Number(process.env.PW_EXPECT_TIMEOUT) || 10_000,
	},

	use: {
		actionTimeout: Number(process.env.PW_ACTION_TIMEOUT) || 15_000,
		navigationTimeout: Number(process.env.PW_NAV_TIMEOUT) || 30_000,
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
```

---

## Environment Variables

Control all timeouts without touching config files — ideal for CI/CD pipelines.

| Environment Variable | Timeout Type       | Default  | Description                             |
| -------------------- | ------------------ | -------- | --------------------------------------- |
| `PW_TEST_TIMEOUT`    | Test Timeout       | `60000`  | Max time (ms) for a single test to run  |
| `PW_GLOBAL_TIMEOUT`  | Global Timeout     | `600000` | Max time (ms) for the entire test suite |
| `PW_EXPECT_TIMEOUT`  | Expect Timeout     | `10000`  | Max time (ms) for assertions to retry   |
| `PW_ACTION_TIMEOUT`  | Action Timeout     | `15000`  | Max time (ms) for click, fill, etc.     |
| `PW_NAV_TIMEOUT`     | Navigation Timeout | `30000`  | Max time (ms) for page.goto() to finish |

### Setting Env Vars

**Linux / macOS:**

```bash
export PW_TEST_TIMEOUT=90000
export PW_GLOBAL_TIMEOUT=900000
export PW_EXPECT_TIMEOUT=15000
export PW_ACTION_TIMEOUT=20000
export PW_NAV_TIMEOUT=45000
npx playwright test
```

**Windows (Command Prompt):**

```cmd
set PW_TEST_TIMEOUT=90000
set PW_ACTION_TIMEOUT=20000
npx playwright test
```

**Windows (PowerShell):**

```powershell
$env:PW_TEST_TIMEOUT = "90000"
$env:PW_ACTION_TIMEOUT = "20000"
npx playwright test
```

**Inline (single command):**

```bash
PW_TEST_TIMEOUT=90000 PW_NAV_TIMEOUT=45000 npx playwright test
```

**.env file (with dotenv):**

```env
PW_TEST_TIMEOUT=90000
PW_GLOBAL_TIMEOUT=900000
PW_EXPECT_TIMEOUT=15000
PW_ACTION_TIMEOUT=20000
PW_NAV_TIMEOUT=45000
```

---

## Quick Reference

| Timeout            | Config Key                | Env Variable        | Default                 |
| ------------------ | ------------------------- | ------------------- | ----------------------- |
| Test Timeout       | `timeout`                 | `PW_TEST_TIMEOUT`   | `30,000 ms`             |
| Global Timeout     | `globalTimeout`           | `PW_GLOBAL_TIMEOUT` | Unlimited               |
| Expect Timeout     | `expect.timeout`          | `PW_EXPECT_TIMEOUT` | `5,000 ms`              |
| Action Timeout     | `use.actionTimeout`       | `PW_ACTION_TIMEOUT` | `0` (uses test timeout) |
| Navigation Timeout | `use.navigationTimeout`   | `PW_NAV_TIMEOUT`    | `0` (uses test timeout) |
| Explicit Wait      | `page.waitForTimeout(ms)` | —                   | As specified            |

---

## Biome (All in one - linter and prettier) Configuration (Removed from Project)

```JSON
{
	"$schema": "https://biomejs.dev/schemas/2.3.8/schema.json",
	"vcs": {
		"enabled": true,
		"clientKind": "git",
		"useIgnoreFile": true
	},
	"files": {
		"ignoreUnknown": false
	},
	"formatter": {
		"enabled": true,
		"formatWithErrors": false,
		"attributePosition": "auto",
		"indentStyle": "tab",
		"indentWidth": 2,
		"lineWidth": 80,
		"lineEnding": "lf"
	},
	"linter": {
		"enabled": true,
		"rules": {
			"recommended": true
		}
	},
	"javascript": {
		"formatter": {
			"quoteStyle": "double"
		}
	},
	"assist": {
		"enabled": true,
		"actions": {
			"source": {
				"organizeImports": "on"
			}
		}
	},
	"json": {
		"formatter": {
			"trailingCommas": "none"
		}
	}
}
```

## Best Practices

- Always define `actionTimeout` and `navigationTimeout` explicitly — they fall back to `timeout` if unset, which can mask slow actions.
- Use **env vars in CI** to set stricter timeouts and catch flaky tests early.
- Avoid `waitForTimeout()` in production tests — prefer `waitForSelector`, `waitForResponse`, or `waitForLoadState`.
- Use `test.setTimeout()` only for known slow tests like file uploads or report generation.

## [Github CLI Manual](https://cli.github.com/manual/gh_variable_set)

Very Helpful for secret,variable handling

## Author

**Anirban Mishra**  
Email: anirbanmishra7005@gmail.com
