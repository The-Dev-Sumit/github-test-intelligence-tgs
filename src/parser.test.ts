import { describe, expect, it } from "vitest";
import { parseJUnitFile, parseJUnitXml } from "./parser.js";

describe("parseJUnitFile", () => {
  it("parses a JUnit file successfully", async () => {
    const result = await parseJUnitFile("./test-results/single-testcase.xml");

    expect(result.source).toBe("junit");
    expect(result.summary).toEqual({
      total: 1,
      passed: 1,
      failed: 0,
      skipped: 0,
    });
  });

  it("throws a clear error when the JUnit file does not exist", async () => {
    await expect(
      parseJUnitFile("./test-results/does-not-exist.xml"),
    ).rejects.toThrow("JUnit file not found");
  });
});





describe("parseJUnitXml", () => {
  it("parses multiple test suites correctly", async () => {
    const result = await parseJUnitFile("./test-results/example.xml");

    expect(result.summary).toEqual({
      total: 8,
      passed: 6,
      failed: 1,
      skipped: 1,
    });
  });

  it("marks failed tests correctly", async () => {
    const result = await parseJUnitFile("./test-results/example.xml");

    const failedTest = result.tests.find(
      (test) => test.name === "logout works",
    );

    expect(failedTest).toEqual({
      name: "logout works",
      classname: "auth",
      suite: "Authentication Tests",
      status: "failed",
      duration: 0.08,
      error: {
        message: "Expected 200 but got 401",
        details: "Expected 200 but got 401",
      },
    });
  });

  it("marks skipped tests correctly", async () => {
    const result = await parseJUnitFile("./test-results/example.xml");

    const skippedTest = result.tests.find(
      (test) => test.name === "delete account works",
    );

    expect(skippedTest).toEqual({
      name: "delete account works",
      classname: "user",
      suite: "User Tests",
      status: "skipped",
      duration: 0.05,
    });
  });

  it("marks passed tests correctly", async () => {
    const result = await parseJUnitFile("./test-results/example.xml");

    const passedTest = result.tests.find((test) => test.name === "login works");

    expect(passedTest).toEqual({
      name: "login works",
      classname: "auth",
      suite: "Authentication Tests",
      status: "passed",
      duration: 0.12,
    });
  });

  it("throws a clear error for invalid XML", () => {
    const xml = `
    <testsuites>
      <testsuite name="Broken Suite">
        <testcase name="broken"
  `;

    expect(() => parseJUnitXml(xml)).toThrow("Failed to parse JUnit XML");
  });

  it("throws a clear error when a testcase has no name", async () => {
    await expect(
      parseJUnitFile("./test-results/missing-name.xml"),
    ).rejects.toThrow("JUnit testcase is missing a name");
  });

  it("throws a clear error when a testcase has no classname", async () => {
    await expect(
      parseJUnitFile("./test-results/missing-classname.xml"),
    ).rejects.toThrow("JUnit testcase is missing a classname");
  });

  it("throws a clear error when no testsuite exists", async () => {
    await expect(
      parseJUnitFile("./test-results/no-testsuite.xml"),
    ).rejects.toThrow("No <testsuite> found in JUnit XML");
  });

  it("handles an empty test suite", async () => {
    const result = await parseJUnitFile("./test-results/empty-suite.xml");

    expect(result.summary).toEqual({
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    });

    expect(result.tests).toEqual([]);
  });

  it("ignores an invalid duration", async () => {
    const result = await parseJUnitFile("./test-results/invalid-duration.xml");

    expect(result.tests[0]).toEqual({
      name: "login works",
      classname: "auth",
      suite: "Authentication Tests",
      status: "passed",
    });
  });

  it("captures failure details when failure has no message attribute", async () => {
    const result = await parseJUnitFile(
      "./test-results/failure-without-message.xml",
    );

    expect(result.tests[0]).toEqual({
      name: "login works",
      classname: "auth",
      suite: "Authentication Tests",
      status: "failed",
      duration: 0.12,
      error: {
        details: "Expected login to succeed but it failed",
      },
    });
  });

  it("captures failure message and details", async () => {
    const result = await parseJUnitFile(
      "./test-results/failure-with-message.xml",
    );

    expect(result.tests[0]).toEqual({
      name: "login works",
      classname: "auth",
      suite: "Authentication Tests",
      status: "failed",
      duration: 0.12,
      error: {
        message: "Login failed",
        details: "Expected login to succeed but it failed",
      },
    });
  });

  it("marks a skipped test with a reason as skipped", async () => {
    const result = await parseJUnitFile(
      "./test-results/skipped-with-reason.xml",
    );

    expect(result.tests[0]).toEqual({
      name: "delete account",
      classname: "user",
      suite: "User Tests",
      status: "skipped",
      duration: 0.05,
    });
  });

  it("parses XML directly", () => {
    const xml = `
    <testsuites>
      <testsuite name="Authentication Tests">
        <testcase
          name="login works"
          classname="auth"
          time="0.12"
        />
      </testsuite>
    </testsuites>
  `;

    const result = parseJUnitXml(xml);

    expect(result).toEqual({
      source: "junit",
      summary: {
        total: 1,
        passed: 1,
        failed: 0,
        skipped: 0,
      },
      tests: [
        {
          name: "login works",
          classname: "auth",
          suite: "Authentication Tests",
          status: "passed",
          duration: 0.12,
        },
      ],
    });
  });
});