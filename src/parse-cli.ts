import { parseJUnitFile } from "./parser.js";

const filePath = "./test-results/example.xml";

const result = await parseJUnitFile(filePath);

console.log(JSON.stringify(result, null, 2));
