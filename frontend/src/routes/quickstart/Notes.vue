<script setup lang="ts">
import Callout from "@/components/harness/Callout.vue";
import Panel from "@/components/harness/Panel.vue";
import PublishedCode from "@/components/harness/PublishedCode.vue";
import RouteHeader from "@/components/harness/RouteHeader.vue";
import SourceCode from "@/components/harness/SourceCode.vue";
import TryIt from "@/components/harness/TryIt.vue";
</script>

<template>
  <RouteHeader path="/quickstart" />

  <Panel title="What it demonstrates">
    <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
      The whole Vue stack in three files: a Node <code>server.ts</code> hosting Copilot Runtime with a <code>BuiltInAgent</code> registered as
      <code>default</code>, the stylesheet imported in <code>main.ts</code>, and an <code>App.vue</code> that points
      <code>CopilotKitProvider</code> at the runtime and renders <code>CopilotChat</code>. Two processes: Vite on :5173, the runtime on :8200.
    </p>
    <div class="mt-4">
      <TryIt
        :prompts="['Hello! What can you do?', 'Write a haiku about Vue.']"
        expect="Tokens stream into the chat and render as markdown. The Inspector button sits in a corner; Agents › Agent lists default."
        fail="No reply, or a CORS / network error in the console — check the backend is running, OPENAI_API_KEY is set in backend/.env, and http://localhost:8200/api/copilotkit/info answers."
      />
    </div>
  </Panel>

  <Panel title="The demo" description="Verbatim src/App.vue. Its runtime-url is the absolute http://localhost:8200 address, so it bypasses the Vite proxy and relies on cors: true — exactly as published.">
    <SourceCode file="frontend/src/routes/quickstart/demo-chat/App.vue" />
  </Panel>

  <Panel title="server.ts, as published">
    <PublishedCode page="index" :index="4" />
  </Panel>

  <Panel title="This repo's server.ts" description="The published file plus additions marked [harness]: the doc agent ids, and two more runtimes on their own base paths.">
    <div class="space-y-4">
      <SourceCode file="backend/server.ts" />
      <SourceCode file="backend/agents.ts" />
    </div>
  </Panel>

  <Panel title="src/main.ts, as published, and this repo's">
    <div class="space-y-4">
      <PublishedCode page="index" :index="5" />
      <SourceCode file="frontend/src/main.ts" />
    </div>
  </Panel>

  <Callout tone="harness" title="What differs from the published Quickstart">
    <p>· <code>main.ts</code> mounts the harness shell and router instead of <code>App.vue</code>; each doc page's own <code>App.vue</code> is mounted by its route.</p>
    <p>· <code>server.ts</code> registers the Quickstart agent under every agent id other Vue pages use (README §3) and dispatches two extra base paths. <code>default</code> is unchanged, as is the listener's <code>basePath</code> and <code>cors: true</code>.</p>
    <p>· Install: the page's <code>npm install @copilotkit/vue @copilotkit/runtime</code> is split across <code>frontend/</code> and <code>backend/</code>; <code>tsx</code>, <code>typescript</code> and <code>@types/node</code> are backend dev dependencies as the page lists.</p>
  </Callout>

  <Callout tone="warn" title="Model">
    <p>The agent uses the page's <code>openai:gpt-6-luna</code> unchanged. If your key cannot reach that model, every route fails with a model error — that is the finding, not a harness bug.</p>
  </Callout>
</template>
