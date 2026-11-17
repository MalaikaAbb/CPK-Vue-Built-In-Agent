<script setup lang="ts">
import Callout from "@/components/harness/Callout.vue";
import Panel from "@/components/harness/Panel.vue";
import PublishedCode from "@/components/harness/PublishedCode.vue";
import RouteHeader from "@/components/harness/RouteHeader.vue";
import SourceCode from "@/components/harness/SourceCode.vue";
import TryIt from "@/components/harness/TryIt.vue";
</script>

<template>
  <RouteHeader path="/generative-ui/state-rendering" />
  <Panel title="What it demonstrates">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      <code>useAgent</code> with <code>OnStateChanged</code> + <code>OnRunStatusChanged</code> on agent <code>researcher</code>;
      <code>ResearchProgress</code> renders <code>status</code>, a progress bar from <code>completed</code>/<code>total</code>, and <code>draft</code>.
    </p>
    <div class="mt-4">
      <TryIt :prompts="['Research the history of the bicycle']" expect="If the agent wrote state: status text, a moving progress bar, a growing draft." fail="What actually happens here: “Idle”, an empty progress bar, and the answer only in the chat." />
    </div>
  </Panel>
  <Panel title="The demo">
    <div class="space-y-4">
      <SourceCode file="frontend/src/routes/generative-ui/state-rendering/demo-chat/components/ResearchProgress.vue" />
      <SourceCode file="frontend/src/routes/generative-ui/state-rendering/demo-chat/App.vue" />
    </div>
  </Panel>
  <Panel title="Backend — in the .md export only"><PublishedCode page="generative-ui__state-rendering" :index="2" /></Panel>
  <Callout tone="warn" title="Why this route is broken (README §9)">
    <p>No backend is published for the built-in agent (“state-streaming-setup is not bundled for built-in-agent”); the only backend code is LangGraph Python that the rendered page does not show. <code>researcher</code> is the Quickstart agent with an empty state, so nothing writes <code>status</code>/<code>completed</code>/<code>draft</code>.</p>
  </Callout>
  <Callout tone="harness" title="Agent id"><p><code>researcher</code> is the Quickstart agent (README §3).</p></Callout>
</template>
