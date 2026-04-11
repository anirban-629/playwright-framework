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

| Type     | Meaning                                      |
|----------|----------------------------------------------|
| `FEAT`   | New feature added                           |
| `FIX`    | Bug fix                                     |
| `PERF`   | Performance improvement                     |
| `DOCS`   | Documentation only changes                  |
| `STYLE`  | Formatting and style (no functional change) |
| `REFACTOR`| Code changes without adding features or fixing bugs |
| `TEST`   | Adding or updating tests                    |
| `BUILD`  | Build or tooling related                    |
| `CI`     | CI configuration changes                    |
| `CHORE`  | Misc maintenance tasks                      |
| `DEPS`   | Dependency updates                          |

Before committing, run:
```bash
npm run commit
```

## Author

**Anirban Mishra**  
Email: anirbanmishra7005@gmail.com

