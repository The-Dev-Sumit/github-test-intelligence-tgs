# GitHub Test Intelligence

A test intelligence tool for collecting automated test results from GitHub Actions, normalizing them into a stable format, storing test history, and building the foundation for future test intelligence features such as flaky-test detection.

## Current Status

The project currently has:

- JUnit XML parser
- Normalized `TestRun` data model
- GitHub Action
- Private backend API
- PostgreSQL storage
- API key authentication
- Deep request payload validation
- Duplicate test-run protection

The dashboard and advanced test intelligence features are planned for later stages.

## Architecture

```text
GitHub Repository
       ↓
GitHub Actions
       ↓
GitHub Test Intelligence Action
       ↓
JUnit XML Parser
       ↓
Normalized TestRun
       ↓
Private Backend API
       ↓
PostgreSQL
       ↓
Dashboard
       ↓
Test History / Flaky Test Detection
```

## Core Principle

JUnit XML is treated as an input format, not as the internal product data model.

Different test frameworks can produce different formats, so the project converts test results into a stable, product-owned `TestRun` structure.

Future parsers for Jest, Vitest, Pytest, and other frameworks can follow the same model.

## Normalized TestRun

```ts
type TestRun = {
  source: "junit" | "jest" | "vitest" | "pytest";

  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
  };

  tests: TestResult[];
};
```

Each test result contains information such as:

```ts
type TestResult = {
  name: string;
  classname: string;
  suite: string;
  status: "passed" | "failed" | "skipped";
  duration?: number;

  error?: {
    message?: string;
    details?: string;
  };
};
```

## JUnit Parser

The parser currently supports JUnit XML.

### `parseJUnitFile(filePath)`

Reads a JUnit XML file from the filesystem and converts it into a normalized `TestRun`.

### `parseJUnitXml(xml)`

Parses JUnit XML content directly and returns a normalized `TestRun`.

Keeping XML parsing separate from filesystem access allows the parser to be reused with XML content from other sources.

## GitHub Action

The project provides a GitHub Action that can be used from a GitHub repository to collect test results.

Example:

```yaml
- name: Run GitHub Test Intelligence
  uses: ./action
  with:
    results-path: ./test-results/example.xml
    api-url: ${{ secrets.TEST_INTELLIGENCE_API_URL }}
    api-key: ${{ secrets.TEST_INTELLIGENCE_API_KEY }}
```

The Action:

1. Reads the configured test result file.
2. Parses the JUnit XML.
3. Creates the normalized `TestRun`.
4. Collects GitHub workflow metadata.
5. Sends the result to the private backend API.

## GitHub Metadata

The Action collects information such as:

- Repository
- Commit SHA
- Branch
- Workflow
- GitHub Actions run ID

This metadata will later allow test results to be connected with commits, branches, workflows, and historical runs.

## Backend

The backend is maintained separately from the public GitHub Action.

The backend:

- Authenticates Action requests using an API key.
- Validates incoming payloads.
- Stores test-run metadata.
- Stores individual test results.
- Prevents duplicate GitHub test runs.

### API

```text
POST /api/test-runs
```

Authentication:

```text
Authorization: Bearer <API_KEY>
```

Successful ingestion returns:

```json
{
  "success": true,
  "testRunId": "<UUID>"
}
```

## Request Validation

The backend validates the incoming payload before writing anything to the database.

Invalid requests return:

```text
400 Bad Request
```

Unauthorized requests return:

```text
401 Unauthorized
```

Duplicate test runs return:

```text
409 Conflict
```

Unexpected server/database failures return:

```text
500 Internal Server Error
```

## Duplicate Protection

A GitHub test run is uniquely identified by:

```text
repository + runId
```

The PostgreSQL database enforces this using a unique constraint.

This prevents the same GitHub Actions run from being stored multiple times if the Action is retried.

## Database

The backend uses PostgreSQL.

Current core models:

```text
TestRun
   │
   └── TestResult[]
```

A `TestRun` stores:

- Repository
- Commit SHA
- Branch
- Workflow
- GitHub run ID
- Test source
- Test summary
- Creation time

Each `TestResult` stores:

- Test name
- Class name
- Suite
- Status
- Duration
- Error message
- Error details

## Testing

The parser contains automated tests covering cases such as:

- Single test case
- Multiple test cases
- Passed tests
- Failed tests
- Skipped tests
- Empty suites
- Invalid duration
- Missing test name
- Missing classname
- Invalid XML
- Missing test suites
- Failure messages and details

Run the tests with:

```bash
pnpm test
```

Type-check the project with:

```bash
pnpm exec tsc --noEmit
```

Build the GitHub Action with:

```bash
pnpm build:action
```

## Tech Stack

### Public Action / Parser

- TypeScript
- Node.js
- fast-xml-parser
- Vitest
- GitHub Actions
- pnpm

### Backend

- TypeScript
- Node.js
- Express
- PostgreSQL
- Prisma ORM

## Project Structure

```text
github-test-intelligence-tgs/
├── src/
│   ├── parser.ts
│   ├── parser.test.ts
│   ├── parse-cli.ts
│   └── types.ts
│
├── test-results/
│
├── action/
│   ├── action.yml
│   ├── index.ts
│   └── dist/
│       └── index.js
│
├── .github/
│   └── workflows/
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── README.md
```

The backend is maintained in a separate private repository.

## Roadmap

### Phase 1 — Foundation

- [x] JUnit XML parser
- [x] Normalized TestRun model
- [x] Parser tests
- [x] GitHub Action
- [x] Private backend API
- [x] PostgreSQL storage
- [x] API authentication
- [x] Payload validation
- [x] Duplicate test-run protection

### Phase 2 — Test History

- [ ] Test-run history
- [ ] Test-level history
- [ ] Commit-based comparison
- [ ] Duration tracking
- [ ] Failure history

### Phase 3 — Test Intelligence

- [ ] Flaky test detection
- [ ] Failure pattern detection
- [ ] Duration regression detection
- [ ] Failure clustering
- [ ] Environment and workflow correlation

### Phase 4 — Dashboard

- [ ] Test-run dashboard
- [ ] Test details
- [ ] Historical charts
- [ ] Failed-test investigation
- [ ] Flaky-test dashboard
- [ ] GitHub integration

## Development

This project uses pnpm.

Install dependencies:

```bash
pnpm install
```

Run parser tests:

```bash
pnpm test
```

Type-check:

```bash
pnpm exec tsc --noEmit
```

Build the GitHub Action:

```bash
pnpm build:action
```
```
