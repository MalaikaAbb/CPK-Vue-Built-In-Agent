import { BuiltInAgent } from "@copilotkit/runtime/v2";

/**
 * [harness] The Quickstart's agent, unchanged, built once per agent id.
 *
 * The Quickstart's server.ts registers exactly one agent, `default`. The other
 * Vue doc pages point their samples at agent ids that no page ever registers
 * (`my-agent`, `sales`, `support`, ...). So that those samples can run
 * verbatim, each of those ids gets its own instance of the Quickstart agent:
 * same model, same prompt, nothing added. Nothing here comes from the page
 * that uses the id; see README §3 for which page uses which id.
 */
export function quickstartAgent() {
  // Verbatim from the Quickstart's server.ts.
  return new BuiltInAgent({
    model: "openai:gpt-6-luna",
    prompt: "You are a helpful assistant for a Vue app.",
  });
}

/** Agent ids the Vue doc samples use, and the page each one comes from. */
export const DOC_AGENT_IDS = {
  "my-agent": "Prebuilt Components, Headless UI, Headless Threads",
  sales: "Programmatic Control",
  support: "Threads Drawer",
  researcher: "State Rendering",
  workspace: "Shared State",
  writer: "State Streaming",
} as const;

export function docAgents() {
  return Object.fromEntries(
    Object.keys(DOC_AGENT_IDS).map((id) => [id, quickstartAgent()]),
  );
}
