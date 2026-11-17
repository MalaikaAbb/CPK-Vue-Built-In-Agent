<script setup lang="ts">
import Callout from "@/components/harness/Callout.vue";
import Panel from "@/components/harness/Panel.vue";
import PublishedCode from "@/components/harness/PublishedCode.vue";
import RouteHeader from "@/components/harness/RouteHeader.vue";
import SourceCode from "@/components/harness/SourceCode.vue";
import TryIt from "@/components/harness/TryIt.vue";
const D = "frontend/src/routes/generative-ui/tool-rendering/demo-chat";
</script>

<template>
  <RouteHeader path="/generative-ui/tool-rendering" />
  <Panel title="What it demonstrates">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      Three ways to draw a tool call: the built-in <code>*</code> renderer from <code>useDefaultRenderTool()</code>, a custom catch-all, and a
      per-tool <code>useRenderTool</code> for <code>get_weather</code> with the wildcard as fallback.
    </p>
    <div class="mt-4">
      <TryIt :prompts="['What is the weather in Tokyo?']" expect="If a get_weather tool existed: “Checking Tokyo” while streaming, then the city and result." fail="What actually happens here: a prose answer and no card — the built-in agent has no get_weather tool (see below)." />
    </div>
  </Panel>
  <Panel title="Published files, mounted verbatim">
    <div class="space-y-4">
      <SourceCode :file="`${D}/default/components/AgentExperience.vue`" />
      <SourceCode :file="`${D}/per-tool/components/WeatherToolCard.vue`" />
      <SourceCode :file="`${D}/per-tool/components/AgentExperience.vue`" />
      <SourceCode :file="`${D}/per-tool/App.vue`" note="The same published App.vue is copied into each variant directory." />
    </div>
  </Panel>
  <Panel title="Custom catch-all" description="The page prints only one line for this file.">
    <div class="space-y-4">
      <PublishedCode page="generative-ui__tool-rendering" :index="1" />
      <SourceCode :file="`${D}/catch-all/components/AgentExperience.vue`" />
      <SourceCode :file="`${D}/catch-all/components/BrandedToolCard.vue`" />
    </div>
  </Panel>
  <Panel title="Published, not mounted">
    <div class="space-y-4">
      <PublishedCode page="generative-ui__tool-rendering" :index="4" note="Fragment: `parameters` and `locale` are never declared." />
      <PublishedCode page="generative-ui__tool-rendering" :index="6" />
    </div>
  </Panel>
  <Callout tone="warn" title="Why this route is broken (README §9)">
    <p>The page says the backend “must expose a tool named <code>get_weather</code>”. For the built-in agent the rendered page publishes no backend at all — the only tool code is the LangGraph Python above, which exists only in the .md export (“tool-rendering-setup is not bundled for built-in-agent”). Per this repo's rules the tool is not written, so the agent has no tools and no renderer ever fires.</p>
  </Callout>
  <Callout tone="harness" title="What the harness added">
    <p>· The catch-all <code>AgentExperience.vue</code> wraps the published line with the zero-config file's imports and template.</p>
    <p>· <code>BrandedToolCard</code> is a stand-in — never published.</p>
  </Callout>
</template>
