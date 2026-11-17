import { createServer } from "node:http";
import { BuiltInAgent, CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";

import { docAgents } from "./agents"; // [harness]
import { createMcpAppsRuntime } from "./runtimes/mcp-apps"; // [harness]
import { createThreadsRuntime, threadsMode } from "./runtimes/threads"; // [harness]

/**
 * The Quickstart's server.ts (https://docs.copilotkit.ai/vue), with additions
 * marked [harness]:
 *
 * 1. `agents` also registers the Quickstart agent under every agent id the
 *    other Vue doc pages use (see agents.ts). `default` is unchanged.
 * 2. Two more runtimes that doc pages publish on their own, each on its own
 *    base path so one page's config cannot reach another page's runs:
 *      /api/copilotkit-threads   Headless Threads' runtime (Intelligence)
 *      /api/copilotkit-mcp-apps  MCP Apps' runtime (mcpApps.servers)
 *    The Quickstart's listener is passed to createServer unchanged; the
 *    harness only puts a prefix dispatch in front of it.
 */

const runtime = new CopilotRuntime({
  agents: {
    default: new BuiltInAgent({
      model: "openai:gpt-6-luna",
      prompt: "You are a helpful assistant for a Vue app.",
    }),
    ...docAgents(), // [harness]
  },
});

const port = Number(process.env.PORT ?? 8200);

// ── [harness] the other runtimes, longest prefix first ──────────────────────
const quickstartListener = createCopilotNodeListener({
  runtime,
  basePath: "/api/copilotkit",
  cors: true,
});
const extraListeners = [
  {
    basePath: "/api/copilotkit-threads",
    listener: createCopilotNodeListener({
      runtime: createThreadsRuntime(),
      basePath: "/api/copilotkit-threads",
      cors: true,
    }),
  },
  {
    basePath: "/api/copilotkit-mcp-apps",
    listener: createCopilotNodeListener({
      runtime: createMcpAppsRuntime(),
      basePath: "/api/copilotkit-mcp-apps",
      cors: true,
    }),
  },
];
const dispatch: Parameters<typeof createServer>[1] = (req, res) => {
  const path = req.url ?? "/";
  const match = extraListeners.find(
    (l) => path === l.basePath || path.startsWith(`${l.basePath}/`),
  );
  return (match?.listener ?? quickstartListener)(req, res);
};
// ────────────────────────────────────────────────────────────────────────────

createServer(
  dispatch, // [harness] published: createCopilotNodeListener({ runtime, basePath: "/api/copilotkit", cors: true })
).listen(port, () => {
  console.log(
    `Copilot Runtime listening at http://localhost:${port}/api/copilotkit`,
  );
  // [harness]
  console.log(`  + /api/copilotkit-threads  (${threadsMode})`);
  console.log(`  + /api/copilotkit-mcp-apps`);
});
