import { parseJUnitFile } from "../src/parser.js";

const resultsPath = process.env["INPUT_RESULTS-PATH"];

if (!resultsPath) {
  throw new Error("results-path input is required");
}

const testRun = await parseJUnitFile(resultsPath);

console.log(JSON.stringify(testRun, null, 2));
