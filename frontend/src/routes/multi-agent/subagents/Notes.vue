<script setup lang="ts">
import Callout from "@/components/harness/Callout.vue";
import Panel from "@/components/harness/Panel.vue";
import PublishedCode from "@/components/harness/PublishedCode.vue";
import RouteHeader from "@/components/harness/RouteHeader.vue";
</script>

<template>
  <RouteHeader path="/multi-agent/subagents" />
  <Callout tone="warn" title="Nothing to implement (README §9)">
    <p>The rendered Vue page for the built-in agent contains <strong>no code blocks at all</strong>. The places where the delegation-log component and the backend would go render empty (“subagents-setup is not bundled for built-in-agent”; the “Rendering a live delegation log” section is a heading and two sentences). Per this repo's rules nothing is written in their place, so there is no demo route.</p>
    <p>The .md export still carries two LangGraph Python blocks (shown below for reference). They are not on the rendered page and are not built-in-agent code.</p>
  </Callout>
  <Panel title="In the .md export only — LangGraph Python">
    <div class="space-y-4">
      <PublishedCode page="multi-agent__subagents" :index="0" />
      <PublishedCode page="multi-agent__subagents" :index="1" />
    </div>
  </Panel>
</template>
