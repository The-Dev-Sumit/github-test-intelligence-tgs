import { parseJUnitFile } from "../src/parser.js";

const resultsPath = process.env["INPUT_RESULTS-PATH"];

if (!resultsPath) {
  throw new Error("results-path input is required");
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

const payload = {
  repository,
  commitSha,
  branch,
  workflow,
  runId,
  testRun,
};

console.log(JSON.stringify(payload, null, 2));
