import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import { registerMemoryHooks } from "./hooks.js";
import { buildMemoryPromptSection } from "./prompt-section.js";
import { MemoryPluginRuntime } from "./runtime.js";
import { pluginConfigJsonSchema, pluginConfigUiHints } from "./config.js";

function isGatewayRuntimeProcess(): boolean {
  return process.argv.some((value) => value === "gateway" || value.includes("openclaw-gateway"));
}

const plugin = definePluginEntry({
  id: "clawxmemory",
  name: "ClawXMemory",
  description: "L0/L1/L2 local-first memory plugin for OpenClaw.",
  kind: "memory",
  configSchema: {
    jsonSchema: pluginConfigJsonSchema,
    uiHints: pluginConfigUiHints,
  },

  register(api): void {
    const runtime = new MemoryPluginRuntime({
      apiConfig: api.config,
      pluginRuntime: api.runtime,
      pluginConfig: api.pluginConfig,
      logger: api.logger,
    });

    api.registerMemoryPromptSection(buildMemoryPromptSection);

    const tools = runtime.getTools();
    api.registerTool(() => tools, { names: tools.map((tool) => tool.name) });
    registerMemoryHooks(api, runtime);

    const liveRuntimeEnabled = isGatewayRuntimeProcess();
    api.registerService({
      id: "clawxmemory-runtime",
      start: () => {
        if (liveRuntimeEnabled) runtime.start();
      },
      stop: () => runtime.stop(),
    });
  },
});

export default plugin;
