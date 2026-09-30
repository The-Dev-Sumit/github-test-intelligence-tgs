import type { GitHubActionPayload } from "../src/types.js";
import { parseJUnitFile } from "../src/parser.js";

const resultsPath = process.env["INPUT_RESULTS-PATH"];
const apiUrl = process.env["INPUT_API-URL"];
const apiKey = process.env["INPUT_API-KEY"];

if (!resultsPath) {
  throw new Error("results-path input is required");
}

if (!apiUrl) {
  throw new Error("api-url input is required");
}

if (!apiKey) {
  throw new Error("api-key input is required");
}

const testRun = await parseJUnitFile(resultsPath);

const repository = process.env.GITHUB_REPOSITORY;
const commitSha = process.env.GITHUB_SHA;
const branch = process.env.GITHUB_REF_NAME;
const workflow = process.env.GITHUB_WORKFLOW;
const runId = process.env.GITHUB_RUN_ID;

if (!repository) {
  throw new Error("GITHUB_REPOSITORY is not available");
}

if (!commitSha) {
  throw new Error("GITHUB_SHA is not available");
}

if (!branch) {
  throw new Error("GITHUB_REF_NAME is not available");
}

if (!workflow) {
  throw new Error("GITHUB_WORKFLOW is not available");
}

if (!runId) {
  throw new Error("GITHUB_RUN_ID is not available");
}

const payload: GitHubActionPayload = {
  repository,
  commitSha,
  branch,
  workflow,
  runId,
  testRun,
};

async function sendTestRun(
  apiUrl: string,
  apiKey: string,
  payload: GitHubActionPayload,
) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Failed to send test results: ${response.status} ${response.statusText} - ${errorBody}`,
    );
  }

  const result = await response.json();

  return result;
}

const result = await sendTestRun(apiUrl, apiKey, payload);

console.log("Test results sent successfully.");
console.log("Test run ID:", result.testRunId);
