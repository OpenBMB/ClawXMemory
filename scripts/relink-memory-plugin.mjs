import { relinkMemoryPlugin } from "./memory-plugin-flow.mjs";

relinkMemoryPlugin({ importMetaUrl: import.meta.url }).catch((error) => {
  console.error(String(error instanceof Error ? error.message : error));
  process.exitCode = 1;
});
