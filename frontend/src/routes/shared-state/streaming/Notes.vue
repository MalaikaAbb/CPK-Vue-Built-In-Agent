<script setup lang="ts">
import Callout from "@/components/harness/Callout.vue";
import Panel from "@/components/harness/Panel.vue";
import PublishedCode from "@/components/harness/PublishedCode.vue";
import RouteHeader from "@/components/harness/RouteHeader.vue";
import SourceCode from "@/components/harness/SourceCode.vue";
import TryIt from "@/components/harness/TryIt.vue";
</script>

<template>
  <RouteHeader path="/shared-state/streaming" />
  <Panel title="What it demonstrates">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <code>StreamingDocument</code> renders agent <code>writer</code>'s <code>state.document</code> with a LIVE badge while
      <code>agent.isRunning</code>.
    </p>
    <div class="mt-4">
      <TryIt :prompts="['Write a short poem about autumn']" expect="If a streaming mapping existed: LIVE, and the poem growing token by token in the article." fail="What actually happens here: LIVE while the run lasts, “Waiting for a draft…” throughout, the poem only in the chat." />
    </div>
  </Panel>
  <Panel title="The demo">
    <div class="space-y-4">
      <SourceCode file="frontend/src/routes/shared-state/streaming/demo-chat/components/StreamingDocument.vue" />
      <SourceCode file="frontend/src/routes/shared-state/streaming/demo-chat/App.vue" />
    </div>
  </Panel>
  <Panel title="Backend — in the .md export only"><PublishedCode page="shared-state__streaming" :index="0" /></Panel>
  <Callout tone="warn" title="Why this route is broken (README §9)">
    <p>The page's whole subject is a backend mapping from a streaming tool argument to a state key. For the built-in agent it publishes none (“state-streaming-setup is not bundled for built-in-agent”) — only LangGraph Python, absent from the rendered page. The page itself warns that “the Vue frontend cannot invent updates the backend never sends.”</p>
  </Callout>
  <Callout tone="harness" title="Agent id"><p><code>writer</code> is the Quickstart agent (README §3).</p></Callout>
</template>
