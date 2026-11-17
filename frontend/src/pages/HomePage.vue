<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import DocDriftPanel from "@/components/doc-sync/DocDriftPanel.vue";
import Panel from "@/components/harness/Panel.vue";
import RouteHeader from "@/components/harness/RouteHeader.vue";
import TryIt from "@/components/harness/TryIt.vue";
import { DOCS_ROOT } from "@/lib/nav-config";

/** Agent ids on the Quickstart runtime. Every one is the Quickstart's BuiltInAgent (backend/agents.ts). */
const AGENTS: [string, string][] = [
  ["default", "Quickstart, Slots, Frontend Tools, Components as Tools, Tool Rendering, Rendering in app, Agent Read-Only Context, HITL, Governed Actions, WebMCP"],
  ["my-agent", "Prebuilt Components, Headless UI, Headless Threads"],
  ["sales", "Programmatic Control"],
  ["support", "Threads Drawer"],
  ["researcher", "State Rendering"],
  ["workspace", "Shared State"],
  ["writer", "State Streaming"],
];

const RUNTIMES = ["/api/copilotkit", "/api/copilotkit-threads", "/api/copilotkit-mcp-apps"];
type Probe = { status: "pending" | "ok" | "error"; detail: string };
const probes = ref<Record<string, Probe>>(
  Object.fromEntries(RUNTIMES.map((r) => [r, { status: "pending", detail: "probing…" }])),
);

onMounted(() => {
  for (const base of RUNTIMES) {
    fetch(`${base}/info`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const info = (await res.json()) as { mode?: string; agents?: Record<string, unknown> };
        probes.value[base] = {
          status: "ok",
          detail: `mode ${info.mode ?? "?"} · agents: ${Object.keys(info.agents ?? {}).join(", ")}`,
        };
      })
      .catch((error: unknown) => {
        probes.value[base] = {
          status: "error",
          detail: `${error instanceof Error ? error.message : String(error)} — is \`npm run dev\` running in backend/?`,
        };
      });
  }
});
</script>

<template>
  <RouteHeader path="/" />

  <DocDriftPanel />

  <Panel title="What this is">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      A working test harness for CopilotKit's <strong>Vue</strong> frontend (<code>@copilotkit/vue</code>) against the
      <strong>built-in agent</strong> — the <code>BuiltInAgent</code> that ships inside <code>@copilotkit/runtime/v2</code>. Each
      route implements one Vue doc page using that page's code verbatim, and shows the exact source that runs. Anything the harness had
      to add is marked <span class="rounded bg-fuchsia-600 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Harness</span>.
    </p>
    <p class="mt-3 text-sm">
      Docs tracked:
      <a :href="DOCS_ROOT" target="_blank" rel="noreferrer" class="text-[var(--accent)] underline underline-offset-4">{{ DOCS_ROOT }}</a>
    </p>
  </Panel>

  <Panel title="Connection" description="Probed from the browser, through the Vite proxy, against each runtime's /info.">
    <ul class="space-y-2 text-sm">
      <li v-for="(probe, base) in probes" :key="base" class="flex flex-wrap items-baseline gap-2">
        <span
          :class="[
            'inline-block h-2 w-2 rounded-full',
            probe.status === 'ok' ? 'bg-emerald-500' : probe.status === 'error' ? 'bg-rose-500' : 'bg-slate-400',
          ]"
        />
        <code class="font-mono text-xs">{{ base }}</code>
        <span class="text-xs text-slate-600 dark:text-slate-400">{{ probe.detail }}</span>
      </li>
    </ul>
  </Panel>

  <Panel
    title="Agent ids"
    description="The Quickstart registers only `default`. Other Vue pages name agent ids no page registers, so each of those is the Quickstart agent, unchanged."
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700">
            <th class="pb-2 pr-4 font-medium">Agent id</th>
            <th class="pb-2 font-medium">Used by</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr v-for="[id, used] in AGENTS" :key="id" class="align-top">
            <td class="py-2 pr-4 font-mono text-xs text-slate-800 dark:text-slate-100">{{ id }}</td>
            <td class="py-2 text-slate-600 dark:text-slate-400">{{ used }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </Panel>

  <Panel title="Start here">
    <TryIt
      :prompts="['What can you do?']"
      expect="On /quickstart → Open demo, a streamed reply rendered as markdown."
      fail="An error banner — check OPENAI_API_KEY in backend/.env and restart the backend."
    />
    <p class="mt-3 text-sm text-slate-600 dark:text-slate-400">
      The <RouterLink to="/status" class="text-[var(--accent)] underline underline-offset-4">status overview</RouterLink> lists every route in one table.
    </p>
  </Panel>
</template>
