# GitHub Test Intelligence

A test intelligence tool that collects automated test results from GitHub Actions and converts them into a normalized format for analysis, history, and future flaky-test detection.

## Current Status

The current implementation focuses on the JUnit XML parser.

The parser converts JUnit XML test results into a stable, product-owned `TestRun` format.

## Current Architecture

JUnit XML
    ↓
JUnit Parser
    ↓
Normalized TestRun
    ↓
GitHub Action
    ↓
Private Backend API
    ↓
PostgreSQL
    ↓
Dashboard


## Parser

The parser currently supports JUnit XML.

There are two parser functions:

### `parseJUnitFile(filePath)`

Reads a JUnit XML file from the filesystem and passes its contents to the XML parser.

### `parseJUnitXml(xml)`

Parses JUnit XML content directly and returns a normalized `TestRun`.

Keeping XML parsing separate from filesystem access allows the core parser to be reused with XML content from other sources.

## Normalized TestRun

The parser produces this structure:

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