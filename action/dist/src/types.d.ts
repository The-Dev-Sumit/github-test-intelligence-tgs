export type TestStatus = "passed" | "failed" | "skipped";
export type TestSource = "junit" | "jest" | "vitest" | "pytest";
export type TestError = {
    message?: string;
    details?: string;
};
export type TestResult = {
    name: string;
    classname: string;
    status: TestStatus;
    suite: string;
    duration?: number;
    error?: TestError;
};
export type TestSummary = {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
};
export type TestRun = {
    source: TestSource;
    summary: TestSummary;
    tests: TestResult[];
};
export type GitHubActionPayload = {
    repository: string;
    commitSha: string;
    branch: string;
    workflow: string;
    runId: string;
    testRun: TestRun;
};
//# sourceMappingURL=types.d.ts.map