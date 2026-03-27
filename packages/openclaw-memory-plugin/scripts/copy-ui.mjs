import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const sourceDir = join(currentDir, "../ui-source");
const targetDir = join(currentDir, "../dist/ui");

mkdirSync(targetDir, { recursive: true });
cpSync(sourceDir, targetDir, {
  recursive: true,
  force: true,
  filter: (path) => !path.endsWith("package.json"),
});

console.log(`Copied UI assets to ${targetDir}`);
