import { XMLParser } from "fast-xml-parser";
import { readFile } from "node:fs/promises";
import type { TestResult, TestRun, TestStatus } from "./types.js";

type JUnitTestCase = {
  "@_name": string;
  "@_classname": string;
  "@_time": string;
  testcase: JUnitTestCase | JUnitTestCase[];

  failure?:
    | string
    | {
        "@_message"?: string;
        "#text"?: string;
      };

  skipped?: unknown;
};

export function parseJUnitXml(xml: string): TestRun {
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  let result;

  try {
    result = parser.parse(xml);
  } catch {
    throw new Error("Failed to parse JUnit XML");
  }

  const testSuite = result.testsuites?.testsuite ?? result.testsuite;

  if (!testSuite) {
    throw new Error("No <testsuite> found in JUnit XML");
  }

  const suites: JUnitTestCase[] = Array.isArray(testSuite)
    ? testSuite
    : [testSuite];

  const tests: TestResult[] = suites.flatMap((suite) => {
    const testCases = suite.testcase
      ? Array.isArray(suite.testcase)
        ? suite.testcase
        : [suite.testcase]
      : [];

    return testCases.map((testCase: JUnitTestCase) => {
      let status: TestStatus = "passed";

      if (!testCase["@_name"]) {
        throw new Error("JUnit testcase is missing a name");
      }

      if (!testCase["@_classname"]) {
        throw new Error("JUnit testcase is missing a classname");
      }

      if (testCase.failure) {
        status = "failed";
      } else if (testCase.skipped !== undefined) {
        status = "skipped";
      }

      return {
        name: testCase["@_name"],
        classname: testCase["@_classname"],
        suite: suite["@_name"],
        status,
        ...(testCase["@_time"] !== undefined &&
        !Number.isNaN(Number(testCase["@_time"]))
          ? { duration: Number(testCase["@_time"]) }
          : {}),
        ...(testCase.failure
          ? {
              error: {
                ...(typeof testCase.failure === "string"
                  ? { details: testCase.failure }
                  : {}),
                ...(typeof testCase.failure === "object" &&
                testCase.failure["@_message"] !== undefined
                  ? { message: testCase.failure["@_message"] }
                  : {}),
                ...(typeof testCase.failure === "object" &&
                testCase.failure["#text"] !== undefined
                  ? { details: testCase.failure["#text"] }
                  : {}),
              },
            }
          : {}),
      };
    });
  });

  return {
    source: "junit",
    summary: {
      total: tests.length,
      passed: tests.filter((test) => test.status === "passed").length,
      failed: tests.filter((test) => test.status === "failed").length,
      skipped: tests.filter((test) => test.status === "skipped").length,
    },
    tests,
  };
}

export async function parseJUnitFile(filePath: string): Promise<TestRun> {
  let xml: string;

  try {
    xml = await readFile(filePath, "utf-8");
  } catch {
    throw new Error("JUnit file not found");
  }

  return parseJUnitXml(xml);
}


