<script setup lang="ts">
import Callout from "@/components/harness/Callout.vue";
import Panel from "@/components/harness/Panel.vue";
import PublishedCode from "@/components/harness/PublishedCode.vue";
import RouteHeader from "@/components/harness/RouteHeader.vue";
import SourceCode from "@/components/harness/SourceCode.vue";
import TryIt from "@/components/harness/TryIt.vue";
</script>

<template>
  <RouteHeader path="/shared-state" />
  <Panel title="What it demonstrates">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      Agent <code>workspace</code>'s state read through <code>useAgent</code> (<code>OnStateChanged</code>) and rendered as a notes list, and
      written back with <code>agent.setState</code> from the “Prefer concise answers” button.
    </p>
    <div class="mt-4">
      <TryIt :prompts="['Click “Prefer concise answers”, then ask: What tone do I prefer?', 'Add a note: buy milk']" expect="After the click the agent can read preferences.tone = concise. A note added by the agent appears in the list." fail="The list never fills and the agent cannot see the tone — see below." />
    </div>
  </Panel>
  <Panel title="The demo">
    <div class="space-y-4">
      <SourceCode file="frontend/src/routes/shared-state/demo-chat/components/SharedWorkspace.vue" />
      <SourceCode file="frontend/src/routes/shared-state/demo-chat/App.vue" />
    </div>
  </Panel>
  <Panel title="The two fragments, as published">
    <div class="space-y-4">
      <PublishedCode page="shared-state" :index="0" />
      <PublishedCode page="shared-state" :index="1" />
    </div>
  </Panel>
  <Panel title="Backend — in the .md export only"><PublishedCode page="shared-state" :index="3" /></Panel>
  <Callout tone="harness" title="What the harness changed">
    <p>· The page prints <code>SharedWorkspace.vue</code> twice — reading, then writing (no imports, uses <code>agent</code> from the first). They are merged into one file, each verbatim.</p>
    <p>· <code>workspace</code> is the Quickstart agent (README §3).</p>
  </Callout>
  <Callout tone="warn" title="Doc notes (README §9)">
    <p>· Nothing seeds the state, so the agent starts with <code>{}</code>. On the React built-in-agent harness the agent only offered its state tools when the run carried non-empty state — not re-verified on Vue. Clicking the button first gives it a non-empty state.</p>
    <p>· The “Streaming partial state updates” section is LangGraph Python in the .md only; the rendered page drops it (“shared-state-setup is not bundled for built-in-agent”).</p>
  </Callout>
</template>
