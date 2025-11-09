import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modelsPath = __dirname;

const modelFiles = fs.readdirSync(modelsPath).filter(
  (file) => file.endsWith(".js") && file !== "index.js"
);

for (const file of modelFiles) {
  const fileUrl = pathToFileURL(path.join(modelsPath, file)).href;
  await import(fileUrl);
}

