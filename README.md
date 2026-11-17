# CopilotKit Vue + Built-in Agent Test Suite

A navigable, working test harness for CopilotKit's **Vue** frontend against the **built-in agent**. Each Vue doc page is a route that runs that page's own code.

| | |
|---|---|
| **Doc sync date** | Machine-maintained: `doc-snapshot/manifest.json` → `syncedAt` (baseline taken 2026-11-12, 22 pages). |
| **CopilotKit packages** | `@copilotkit/vue` 1.87.0 · `@copilotkit/core` 1.87.0 · `@copilotkit/runtime` 1.87.0 (backend) · `@ag-ui/client` 1.0.2 (via `@copilotkit/vue`) |
| **Frontend** | Vite 8.3 · Vue 3.5 · vue-router 5.5 · TypeScript 6.0 · Tailwind 4.3 (harness chrome only) · Shiki 4.6 · zod 3.25.76 |
| **Backend** | Node 24 · `tsx` 4.23 · TypeScript 7.0, which is the Vue Quickstart's `server.ts` |
| **Build status** | No CI. `vite build` ✅. `vue-tsc` reports 8 errors, all in published doc code (§9.10). Every route and every demo sample (64 URLs) mounted in headless Chrome with **zero console or page errors**. **No route has been driven against a live model yet**: statuses come from code inspection plus those mount checks. |

---

## 2. Overview

`@copilotkit/vue` is CopilotKit's Vue 3 frontend: components and composables from `@copilotkit/vue/v2`. The **built-in agent** is `BuiltInAgent` from `@copilotkit/runtime/v2`, CopilotKit's own agent, which calls the model directly. The Vue Quickstart pairs the two, with a Vite app on one port and a small Node Copilot Runtime on another.

This repo turns the Quickstart and the Basics, Generative UI, Interactivity and Agent capabilities sections of the Vue sidebar (22 pages) into one navigable Vite app. Every route mounts the page's code verbatim, bugs included, and shows the exact files that run. Anything the harness had to add is marked **[harness]** in the file, in a pink **Harness** callout on the notes page, and, for stand-in components, with a **HARNESS STAND-IN** badge on screen.

Tracks: **<https://docs.copilotkit.ai/vue>** (with the built-in agent selected as the backend).

---

## 3. Architecture

```
Browser — Vite dev server · localhost:5173
  │  @copilotkit/vue/v2  (CopilotKitProvider, CopilotChat, composables)
  │  each /<route>/demo-chat mounts that doc page's own App.vue,
  │  provider included — there is no app-wide provider
  │
  │  runtime-url="/api/copilotkit…"  ──► Vite proxy  /api → :8200
  │  (Quickstart's App.vue: http://localhost:8200/api/copilotkit, direct, CORS)
  ▼
Node · backend/server.ts · localhost:8200     ← the Quickstart's server.ts
  │  createServer(…) + createCopilotNodeListener({ cors: true })
  │  /api/copilotkit            Quickstart runtime (SSE)
  │  /api/copilotkit-threads    Intelligence quickstart's runtime (if key set)       [harness: own path]
  │  /api/copilotkit-mcp-apps   MCP Apps' runtime (mcpApps.servers)                   [harness: own path]
  ▼
BuiltInAgent ("openai:gpt-6-luna")  ──►  OpenAI
                                         MCP Apps server on :3101 (npm run mcp:apps), MCP Apps route only
```

**Backend language:** TypeScript on Node, run with `tsx`, exactly as the Vue Quickstart runs it. There is no Python and no agent framework.

**Two processes, two ports.** This is what the Quickstart prescribes ("Vite and Copilot Runtime run on separate origins"). Most Vue samples use the same-origin `runtime-url="/api/copilotkit"`, so the Vite dev server proxies `/api` to the runtime. The Quickstart's own `App.vue` uses the absolute `http://localhost:8200` URL and relies on `cors: true`, as published.

### Agent ids

The Quickstart registers one agent, `default`. Other Vue pages point their samples at ids that no page ever registers. **Each of those ids is the Quickstart agent, unchanged** (`backend/agents.ts`). Nothing is added from the page that uses the id.

| Agent id | Used by |
|---|---|
| `default` | Quickstart, Slots, Frontend Tools, Components as Tools, Tool Rendering, Render state in app, Agent Read-Only Context, HITL, useInterrupt, Headless Interrupts, Governed Actions, WebMCP |
| `my-agent` | Prebuilt Components, Headless UI, Headless Threads |
| `sales` | Programmatic Control |
| `support` | Threads Drawer |
| `researcher` | State Rendering |
| `workspace` | Shared State |
| `writer` | State Streaming |

---

## 4. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | **24.12+** (or 22.18+) | `create-vue`'s scaffold requires it. Developed on 24.16. The Quickstart's own minimum is 20. |
| npm | 10+ | Developed on npm 12. |
| Python 3 | 3.9+ | Only for `npm run doc-files` (regenerating doc files from the snapshot). Not needed to run the app. |
| OpenAI API key | — | Required. The agent uses the Quickstart's `openai:gpt-6-luna` unchanged. |
| CopilotKit Intelligence key | — | Optional. Needed by the two Threads routes. Get it with the CopilotKit CLI (§5). |

---

## 5. Setup

```bash
git clone <this-repo> built-in-agent && cd built-in-agent
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cp .env.example backend/.env
```

Then edit `backend/.env`:

| Variable | What it does |
|---|---|
| `OPENAI_API_KEY` | **Required.** Read by `BuiltInAgent`. Server-side only; the browser never sees it. |
| `PORT` | Optional. Runtime port, default **8200** (the Quickstart's). The Vite proxy targets 8200, so change both together. |
| `CPK_INTELLIGENCE_API_KEY` | Optional. Makes `/api/copilotkit-threads` an Intelligence runtime instead of SSE (§9.3). Easiest way to get it: `cd backend && npx copilotkit@latest login && npx copilotkit@latest project select`, which writes it to `backend/.env` ([Intelligence quickstart](https://docs.copilotkit.ai/vue/intelligence/quickstart)). |
| `APP_USER_ID` | Optional. The fixed local identity the Threads runtime gives every caller, default `local-user` (§9.3). |
| `MCP_APPS_URL` | Optional. Overrides the MCP Apps server URL, default `http://localhost:3101/mcp` (§9.4). |
| `COPILOTKIT_TELEMETRY_DISABLED` | Optional. `true` opts out of the runtime telemetry it announces on startup. |

**Ports:** frontend **5173** (`strictPort`), runtime **8200**, MCP Apps example server **3101** (only for `/generative-ui/mcp-apps`).

---

## 6. Running the project

Two terminals, as in the Quickstart:

```bash
# terminal 1 — Copilot Runtime
cd backend && npm run dev
```

Success looks like:

```
Copilot Runtime listening at http://localhost:8200/api/copilotkit
  + /api/copilotkit-threads  (sse)
  + /api/copilotkit-mcp-apps
```

```bash
# terminal 2 — Vue app
cd frontend && npm run dev
```

```
VITE v8.3.8  ready in … ms
➜  Local:   http://localhost:5173/
```

Open **<http://localhost:5173>**. The **Connection** panel on the landing page probes all three runtimes through the proxy and lists their agents.

**For `/generative-ui/mcp-apps` only**, start the official ext-apps example server in a third terminal:

```bash
cd backend && npm run mcp:apps     # @modelcontextprotocol/server-basic-react on :3101
```

Health checks that need no model call:

```bash
curl -s http://localhost:8200/api/copilotkit/info          # mode "sse", agents default, my-agent, sales, …
curl -s http://localhost:5173/api/copilotkit/info          # same, through the Vite proxy
```

The backend's `npm run dev` loads `backend/.env` (`tsx --env-file-if-exists=.env`). Exporting `OPENAI_API_KEY` in the shell, as the Quickstart does, also works.

---

## 7. What to expect: walkthrough per section

### How each route is split

| | |
|---|---|
| **`<route>`** | Notes, Try-it prompts with pass/fail criteria, **the exact source that runs** (Vite `?raw` imports, so it is always what is on disk), samples the page publishes but that cannot be mounted (shown exactly as published), and Harness/gap callouts. |
| **`<route>/demo-chat`** | Just the running feature under a one-line bar; opened via **Open demo ↗**. Where a page has several samples, a **Sample** picker switches between them (`?v=`); each switch unmounts the previous sample and its provider. |

### Getting Started

**`/`**: landing page with doc-drift summary, runtime connection probe, and agent ids.

**`/quickstart`**: `CopilotChat` in the Quickstart's own `App.vue`, talking straight to `:8200`. **Try:** `Hello! What can you do?` **Pass:** tokens stream and render as markdown, and the Inspector's Agents › Agent tab lists `default`. **Fail:** no reply or a CORS error, which means the backend is not running or `OPENAI_API_KEY` is missing.

### Basics

**`/prebuilt-components`**: `<CopilotChat agent-id="my-agent" />`. **Try:** `Hello`, then `What did I just say?` **Pass:** the second answer recalls the first message.

**`/custom-look-and-feel/slots`**: nine samples. **Try:** *welcome-screen*: click **Show my open tickets**. *Assistant message*: send `Hello`. *Three levels*: send `Hello`. *Labels*: look at the input. **Pass:** a custom welcome card whose button sends the message; a **Reviewed** badge in each reply's toolbar; *disclaimer* shows **no** disclaimer at all (doc bug, §9.15); a **Copy response** button in place of the copy icon; the custom placeholder and disclaimer text. **Fail:** an unchanged default chat.

**`/custom-look-and-feel/headless-ui`**: *minimal*: plain `<article>` rows and an `<input>`. *Complete*: the published `RenderedMessages` over the same agent. **Try:** `Write two sentences about otters`. **Pass:** text streams into bare rows, "Thinking…" shows while running, and in *complete* the same conversation renders in CopilotKit's bubbles.

**`/programmatic-control`**: the page's two buttons. The default sample adds a `CopilotChat` on the same agent (harness, added on request); the verbatim `App.vue`, buttons only, is the second sample. **Try:** **Run agent**, then **Stop** mid-run. **Pass:** the buttons flip while running, and the chat shows "Summarize the latest sales data" with the streamed reply, cut short by Stop. In the verbatim sample, watch the Inspector's AG-UI Events on agent `sales` instead.

**`/prebuilt-components/copilot-threads-drawer`**: six samples; needs `CPK_INTELLIGENCE_API_KEY` (§5). **Check first:** `curl -s localhost:8200/api/copilotkit-threads/info` reports `mode: "intelligence"`, and the Inspector's Home shows **Intelligence connected**. **Pass:** a thread gets a row after its first run, selecting a row replays it, and **New conversation** resets the chat. **Fail:** a locked drawer (no Threads entitlement on the project), or an empty list in SSE mode (no key).

**`/headless-threads`**: hand-built `useThreads` list, on the same Intelligence runtime. **Pass:** rows appear after first runs; selecting one replays it; Rename, Archive and Delete work. **Fail:** "Loading…" forever or an empty list, meaning no key or no Intelligence connection.

**`/frontend-tools`**: `filter_incidents`. **Try:** `Only show sev1 incidents`. **Pass:** "Current filter:" changes to `sev1` and the agent confirms. **Fail:** a prose answer with the filter unchanged.

### Generative UI

**`/generative-ui/tool-based`**: `useComponent` → `show_weather`. **Try:** `Show me the weather in Paris`. **Pass:** an inline WeatherCard (values invented by the model).

**`/generative-ui/tool-rendering`**: three renderers. **Expected now:** a prose answer and no card, because there is no backend tool (§9.5).

**`/generative-ui/state-rendering`**: **Expected now:** "Idle" and an empty progress bar throughout (§9.6).

**`/generative-ui/mcp-apps`**: needs `npm run mcp:apps`. **Try:** `What time is it on the server?` **Pass:** a tool call, then an inline sandboxed iframe app. **Fail:** plain text or a run error naming 3101, meaning the MCP server is not running.

### Interactivity

**`/shared-state`**: **Try:** click **Prefer concise answers**, then `What tone do I prefer?` **Pass:** the agent answers "concise". Notes the agent writes appear in the list (§9.12).

**`/shared-state/rendering-in-app`**: **Try:** `Rename the project to "Spring release"`. **Pass:** the canvas heading changes in place. On load it shows "Project launch" and two items, which the Canvas seeds itself.

**`/shared-state/streaming`**: **Expected now:** LIVE while running, and "Waiting for a draft…" throughout (§9.6).

**`/shared-state/agent-readonly`**: **Try:** `Which workspace am I in?` **Pass:** "northstar", with no tool call.

**`/human-in-the-loop`**: **Try:** `Schedule a meeting about Q3 planning with Dana`. **Pass:** a time-picker card (a stand-in, §9.8); picking a slot resumes the run, and the agent confirms the time.

**`/human-in-the-loop/useInterrupt`**, **`/human-in-the-loop/headless`**: **Expected now:** no interrupt ever appears (§9.7).

**`/human-in-the-loop/governed-actions`**: **Try:** `Refund $40 to customer 1182. Call approve_governed_action first with id a-1, tool send_refund, reference POL-7, verdict require_approval.` Repeat with `allow` and `deny`. **Pass:** `require_approval` shows **Approve and run / Reject**; `allow` and `deny` resolve without asking, labelled "Allowed by policy" / "Blocked by policy".

**`/webmcp`**: **Pass:** the status line reads "present" in Chrome 149+ with `chrome://flags/#enable-webmcp-testing`, and `searchOrders` appears in the Model Context Tool Inspector. Every call throws (§9.9).

### Agent capabilities

**`/multi-agent/subagents`**: notes only. The rendered page publishes no code (§9.1).

### Harness

**`/status`**: every route in one table. **`/doc-sync`**: drift report (see *Doc drift detection*).

---

## 8. Testing checklist / current status

| Doc page | Route | Status | Notes |
|---|---|---|---|
| `/vue` | `/` | 📖 Reference | Landing page. |
| `/vue` (Quickstart) | `/quickstart` | ✅ Working | Mounts clean; not yet run against a live model. |
| `/vue/prebuilt-components` | same | ✅ Working | Only `CopilotChat` has code on the page. |
| `/vue/custom-look-and-feel/slots` | same | ⚠️ Partial | Fragments need imports; two stand-ins; `labels` type error; disclaimer sample renders nothing (§9.10, §9.11, §9.15). |
| `/vue/custom-look-and-feel/headless-ui` | same | ✅ Working | Complete example paired with the minimal composer (§9.11). |
| `/vue/programmatic-control` | same | ✅ Working | Default sample adds a harness chat to show the run (on request); verbatim sample is buttons only. |
| `/vue/prebuilt-components/copilot-threads-drawer` | same | ⚠️ Partial | Intelligence wired per the Intelligence quickstart with its fixed local identity; needs a key; not yet verified against a live project (§9.3). |
| `/vue/headless-threads` | same | ⚠️ Partial | Same runtime (§9.3). |
| `/vue/frontend-tools` | same | ✅ Working | |
| `/vue/generative-ui/tool-based` | same | ✅ Working | |
| `/vue/generative-ui/tool-rendering` | same | ❌ Broken | No backend tool published for the built-in agent (§9.5). |
| `/vue/generative-ui/state-rendering` | same | ❌ Broken | No backend published (§9.6). |
| `/vue/generative-ui/mcp-apps` | same | ⚠️ Partial | Placeholder URL replaced; needs `npm run mcp:apps` (§9.4). |
| `/vue/shared-state` | same | ⚠️ Partial | Two fragments merged; agent starts with empty state (§9.11, §9.12). |
| `/vue/shared-state/rendering-in-app` | same | ✅ Working | `toggleItem` fragment shown, not wired. |
| `/vue/shared-state/streaming` | same | ❌ Broken | No backend published (§9.6). |
| `/vue/shared-state/agent-readonly` | same | ✅ Working | |
| `/vue/human-in-the-loop` | same | ⚠️ Partial | `TimePickerCard` stand-in; no App.vue published (§9.8). |
| `/vue/human-in-the-loop/useInterrupt` | same | ❌ Broken | BuiltInAgent never interrupts; `MeetingChat` stand-in (§9.7). |
| `/vue/human-in-the-loop/headless` | same | ❌ Broken | Only App.vue published; `HeadlessInterruptPanel` stand-in (§9.7). |
| `/vue/human-in-the-loop/governed-actions` | same | ⚠️ Partial | HITL half runs; interrupt half cannot fire; `executeSideEffect` undefined. |
| `/vue/webmcp` | same | ⚠️ Partial | **Verified in Chrome** (DevTools › Application › WebMCP): tool discovered with description and `readOnly` flag. Demo is `OrderSearch.vue` with a labelled `searchOrders` stand-in only (user's choice); `webmcp.ts` shown, not mounted. As published, every call errors (§9.9). |
| `/vue/multi-agent/subagents` | same | ❌ Broken | Rendered page has no code at all (§9.1). |

**Legend:** ✅ Working · ⚠️ Partial · 📖 Reference · 🚧 Not started · ❌ Broken

> **Caveat on "Working":** everything the feature needs is published and wired, the route mounts in headless Chrome with no console or page errors, and the doc code is verbatim. None of these routes has been driven against a live model yet.

---

## 9. Known issues / doc-vs-implementation discrepancies

All against `@copilotkit/vue` / `@copilotkit/runtime` 1.87.0, docs as of the 2026-11-12 baseline.

**1. The `.md` export is not the rendered page, and Sub-agents renders no code at all.**
For the built-in agent, every Python block in the `.md` export is missing from the rendered page: the LangGraph backends on [Tool Rendering](https://docs.copilotkit.ai/vue/generative-ui/tool-rendering), [State Rendering](https://docs.copilotkit.ai/vue/generative-ui/state-rendering), [Shared State](https://docs.copilotkit.ai/vue/shared-state), [State Streaming](https://docs.copilotkit.ai/vue/shared-state/streaming) and [Sub-agents](https://docs.copilotkit.ai/vue/multi-agent/subagents). The `.md` marks each one `<!-- setup skipped: …-setup is not bundled for built-in-agent -->`. On the rendered Sub-agents page both the backend and the "Rendering a live delegation log" component render empty, so it publishes **zero** code blocks. Every non-Python block (61 of them) was checked present on the rendered page before being used here (`frontend/scripts/build-doc-catalog.py`). `/doc-sync` diffs the `.md`, so a change only to the rendered page is invisible to it.

**2. Agent ids no page registers.**
`my-agent`, `sales`, `support`, `researcher`, `workspace` and `writer` are used by samples, and only `default` is ever registered. Each is the Quickstart agent (§3).

**3. Threads (Drawer + Headless): Intelligence wired per the Vue Intelligence quickstart.**
[Headless Threads](https://docs.copilotkit.ai/vue/headless-threads)' own `server.ts` cannot run: its `identifyUser` calls `verifyAppSession(request)`, which no Vue page defines, and its `agents: { default: agent }` uses an undefined `agent`. That snippet is shown on the route as published and is **not mounted**. At the user's direction, the Threads runtime instead follows the [Vue Intelligence quickstart](https://docs.copilotkit.ai/vue/intelligence/quickstart) (TypeScript tab), whose runtime code is mounted verbatim (`backend/runtimes/threads.ts`):
- Its `identifyUser` calls `authenticateApplicationUser(request)`, which is also never defined (the page says it "represents your server-side authentication function"). The same page says "a fixed identity is suitable only for a local, single-user demo", so it returns a fixed `{ id: "local-user", name: "Local user" }`. These are the page's own local-demo values from its native-runtime tabs, overridable with `APP_USER_ID`. **This is not authentication:** every caller is the same user. The page's production warnings (`onRequest` gate, thread ownership on `threads/events`, `threads/state` and `agent/stop`) are not implemented.
- `new CopilotKitIntelligence({ apiKey })` **throws at construction** when the key is blank ("`apiKey` is required and cannot be blank"), which would take the whole server down. So the page's runtime is built only when `CPK_INTELLIGENCE_API_KEY` is set. Otherwise `/api/copilotkit-threads` is a plain SSE runtime with the same agents and no thread store; the runtime logs that `GET /threads` returns 403 without `identifyUser`.
- Verified locally: with a (fake) key, `/api/copilotkit-threads/info` reports `mode: "intelligence"` and every agent, and `/api/copilotkit` is unaffected. The fake key's entitlement lookup reports `unavailable`, as expected. **Not yet verified against a real project.** Do that with the page's own check: Inspector → Home shows **Intelligence connected**, and after one message the thread appears under **Rich Threads**.
- The Drawer samples pass `public-license-key="ck_pub_..."`, a placeholder, kept verbatim. A locked drawer means the project has no Threads entitlement.
- To keep this runtime from affecting other routes, it is mounted at `/api/copilotkit-threads`, and the three Threads `App.vue` files have `runtime-url` changed from the published `/api/copilotkit` (kept as a comment). This follows the React harness's §9.49 precedent.

**4. MCP Apps: placeholder server, undefined `agent`.**
[MCP Apps](https://docs.copilotkit.ai/vue/generative-ui/mcp-apps) configures `url: "https://mcp.example.com/mcp"`, which does not resolve. It is replaced by the page's own HTTP transport example, `http://localhost:3101/mcp`, served by the official ext-apps example (`npm run mcp:apps`); the published line is kept as a comment. `mcpApps` applies to every agent on a runtime, so this is its own runtime at `/api/copilotkit-mcp-apps` and both `App.vue` `runtime-url`s are changed (labelled).

**5. Tool Rendering has no tool to render.**
The page says the backend "must expose a tool named `get_weather`". No built-in-agent backend is published (§9.1), and per this repo's rules none is written. The agent therefore has no tools, and none of the three renderers ever fires.

**6. State Rendering and State Streaming have no backend.**
Both pages depend on a backend that writes, or streams, agent state. None is published for the built-in agent. The Streaming page itself says "the Vue frontend cannot invent updates the backend never sends."

**7. `useInterrupt` cannot fire with the built-in agent.**
[useInterrupt](https://docs.copilotkit.ai/vue/human-in-the-loop/useInterrupt), [Headless Interrupts](https://docs.copilotkit.ai/vue/human-in-the-loop/headless) and the interrupt half of [Governed Actions](https://docs.copilotkit.ai/vue/human-in-the-loop/governed-actions) wait for `RUN_FINISHED` with `outcome.type === "interrupt"` or a legacy `on_interrupt` event. `BuiltInAgent` emits neither, and no page publishes a backend that pauses. The useInterrupt `App.vue` imports a `MeetingChat.vue` that is never published. Headless Interrupts publishes only `App.vue`, which imports a never-published `HeadlessInterruptPanel.vue`.

**8. Components used but never published: flagged stand-ins.**
By the user's rule, a component gets a minimal stand-in only when the page cannot function without it. Each stand-in is flagged in its file, with a **HARNESS STAND-IN** badge on screen, and on the notes page:
`searchOrders` (WebMCP demo, on request; §9.9), `TimePickerCard.vue` (HITL), `CustomMessageView` and `CustomToolbarAction` (Slots), `BrandedToolCard` (Tool Rendering), `MeetingChat.vue` (useInterrupt), `HeadlessInterruptPanel.vue` (Headless Interrupts). HITL Overview also publishes no `App.vue`; `HarnessApp.vue` mounts `MeetingApproval` beside a `CopilotChat`.

**9. Functions used but never defined: left undefined.**
`searchOrders` ([WebMCP](https://docs.copilotkit.ai/vue/webmcp), both samples), `verifyAppSession` (§9.3, in the unmounted Headless Threads runtime), and `executeSideEffect` (Governed Actions' resume handler, shown and not mounted). Calls throw at runtime; registration and discovery still work. For WebMCP this was confirmed in Chrome: DevTools › Application › WebMCP lists `searchOrders` with its description and `readOnly` flag, and every **Run tool** call ends in Error. At the user's request, the WebMCP demo now shows **only** `OrderSearch.vue` with a flagged stand-in, `frontend/src/routes/webmcp/demo-chat/search-orders.standin.ts`, which returns fixed sample orders. It is installed as a browser global only while the demo is mounted, so the published file stays verbatim. `webmcp.ts` (the `CopilotKitCore` sample) is shown on the notes page but no longer mounted.

**10. Type errors in published code (`npm run type-check`).**
- Slots › Labels: the `labels` prop is typed with **literal default strings**, so `chatInputPlaceholder: 'Ask your agent anything…'` and `chatDisclaimerText: 'AI responses may be inaccurate.'` fail ("not assignable to type '"Type a message..."'"). The labels render correctly at runtime.
- `useRenderTool`, `useDefaultRenderTool` and `useHumanInTheLoop` reject a render **component** that declares only the props it uses (published `WeatherToolCard`, `GovernedActionCard`; the `MeetingApproval` and catch-all stand-ins follow the same published pattern). `useComponent` accepts the same pattern (`WeatherCard` typechecks).
- `searchOrders` is undefined (×2).

`npm run build` is `vite build`, which does not typecheck, matching the React harness's `ignoreBuildErrors`. `npm run type-check` lists all 8 errors.

**11. Fragments, and how each was mounted.**
- Slots prints seven `<CopilotChat>` fragments with no `<script>`. Each file adds imports only. "Three levels deep" reads `assistantProps` from a slot it does not print, so it is nested inside the "Two levels" fragment's `#assistant-message="assistantProps"`.
- Headless UI's provider markup gets imports only. `RenderedMessages.vue` has no composer and no published `App.vue`, so it is mounted under those providers with the minimal example's `HeadlessChat.vue` as its input (`HarnessComplete.vue`).
- Shared State prints `SharedWorkspace.vue` twice (reading, then writing; the second has no imports and uses `agent` from the first). They are merged into one file, each verbatim.
- Threads Drawer: `ControlledChat.vue` ("render it inside your `<CopilotKitProvider>`") and the header/row-slot fragments are mounted under HarnessProvider. The CSS-parts rule is injected only while its sample is open.
- **Shown only, not mounted:** Programmatic Control's `agent.subscribe` watcher, Tool Rendering's watch-sources line, Headless Threads' pagination block, Rendering-in-app's `toggleItem`, useInterrupt's multi-interrupt template, and Governed Actions' `GovernedAction` type and `handleApproval`. Each reads names it does not declare, and mounting it would mean writing the surrounding code.

**12. Shared State starts with empty state.**
Nothing on the page seeds agent `workspace`'s state, so the agent starts with `{}`. On the React built-in-agent harness the agent offered its state tools only when the run carried non-empty state (React §9.9). That is **not yet re-verified on Vue**. Clicking **Prefer concise answers** first gives it non-empty state.

**13. Smaller doc notes.**
- [Prebuilt Components](https://docs.copilotkit.ai/vue/prebuilt-components) names `CopilotSidebar`, `CopilotPopup` and `useConfigureSuggestions` without code, and says other variations "do not have a runnable Vue Showcase route yet".
- [Agent Read-Only Context](https://docs.copilotkit.ai/vue/shared-state/agent-readonly) credits "the backend's CopilotKit middleware"; for the built-in agent the runtime passes context to `BuiltInAgent` directly.
- Governed Actions' card `args` type omits `tool` and `arguments`, so it never shows them, while the page's guardrails say to show the exact arguments before approval.
- The Quickstart's model id `openai:gpt-6-luna` is used unchanged everywhere.

**14. The Vue harness itself.**
- No root `CopilotKitProvider`. Unlike the React harness, every demo mounts its page's own `App.vue`, provider included, so conversation state does not carry between routes or samples.
- Demo samples load lazily (`defineAsyncComponent` in each generated `Demo.vue`), so a sample's module, and any side effect it has on import, runs only when that sample is chosen. Eager imports had made WebMCP's `webmcp.ts` register `searchOrders` on every WebMCP sample ("Duplicate tool name").
- WebMCP's published `OrderSearch.vue` has a `<script setup>` and no template, so Vue warns "Component is missing template or render function". This is harmless and kept verbatim.
- Doc sync runs as Vite dev-server middleware (`frontend/harness/vite-plugin.ts`) instead of a Next Server Action; it is dev-only by construction.
- Vite 8 warns that the config's extensionless imports are unsupported by its future native config loader. This is harmless today.

**15. Slots › Disclaimer: the published sample never renders its disclaimer.**
[Slots](https://docs.copilotkit.ai/vue/custom-look-and-feel/slots) replaces the disclaimer with `<CopilotChatInput v-bind="inputProps"><template #disclaimer>…`. `CopilotChat`'s `#input` slot props (`modelValue`, `isRunning`, `inputMode`, `inputToolsMenu`, `attachments`, …) do not include `showDisclaimer`. `CopilotChatInput` shows its disclaimer only when `showDisclaimer ?? positioning === "absolute"` is true, which it is not here; `CopilotChat`'s own default input passes `show-disclaimer` explicitly. The `#disclaimer` slot is therefore never rendered, and the default disclaimer disappears too. Found by the user on `/custom-look-and-feel/slots/demo-chat?v=disclaimer`; confirmed in the `@copilotkit/vue` 1.87.0 bundle. Left as published. The fix would be adding `show-disclaimer` to the sample's `CopilotChatInput`.

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Chat never answers; console shows `ERR_CONNECTION_REFUSED` / 502 on `/api/copilotkit` | Runtime not running | `cd backend && npm run dev`. The Quickstart's own troubleshooting: `http://localhost:8200/api/copilotkit/info` must return agent information. |
| CORS error on `/quickstart` only | That `App.vue` calls `:8200` directly | Keep `cors: true` in `server.ts` (the Node listener is CORS-disabled by default). |
| Run errors with a model or auth message | `OPENAI_API_KEY` missing or wrong, or no access to `gpt-6-luna` | Set it in `backend/.env` (or export it) and restart the backend. |
| Chat renders unstyled | Stylesheet not imported | `@copilotkit/vue/styles.css` is imported in `src/main.ts`; don't remove it. |
| `Agent my-agent not found` (or `sales`, …) | Backend is not this repo's `server.ts` | Run `backend/server.ts`, which registers every doc agent id. |
| Server exits with "`apiKey` is required and cannot be blank" | Pasted the Threads runtime into the main runtime | Keep Intelligence on `/api/copilotkit-threads` only (§9.3). |
| Threads routes show an empty list | No `CPK_INTELLIGENCE_API_KEY`, so the Threads runtime is in SSE mode | `cd backend && npx copilotkit@latest login && npx copilotkit@latest project select`, then restart the backend; `/api/copilotkit-threads/info` must say `mode: "intelligence"`. |
| Drawer shows a locked view | The project has no Threads entitlement | Check the project in the CopilotKit dashboard (§9.3). |
| Auth error on the first Threads request | Key empty or from another project (Intelligence quickstart troubleshooting) | Re-run `project select` in `backend/`. |
| MCP Apps answers in plain text | No MCP server on :3101 | `cd backend && npm run mcp:apps`, then retry. |
| `Port 5173 is in use` | Another Vite instance | Stop it; the port is `strictPort` so the README's URLs stay right. |
| `/doc-sync` says "dev server only" | Running `vite preview` / a static build | Doc sync needs `npm run dev`. |

---

## Doc drift detection

`/doc-sync` (and the panel on `/`) is ported from the React harness. **Sync docs now** fetches the `.md` behind all 22 tracked pages, diffs each against `doc-snapshot/pages/`, replaces the snapshot, and ranks changes: **High** for code inside a fence or a changed fence count, **Medium** for headings, titles, or prose next to changed code, **Low** for other prose. Every response is checked to be `text/markdown`, and a run commits all pages or none. `doc-snapshot/CHANGELOG.md` is written only when something changed (the newest three dated entries are kept). The sitemap check works here (`/vue` is a real section prefix: 80 URLs, 59 recorded as `knownUnmapped` at baseline).

> **Blind spot:** the `.md` carries Python blocks the rendered page drops (§9.1).

**Regenerating the doc files after a sync:** `cd frontend && npm run doc-files`. This rebuilds the block catalog from `doc-snapshot/pages/` (re-checking every block against the live rendered page) and rewrites every verbatim doc file plus `src/lib/published.json`. It touches no harness file. Re-running it on the baseline reproduces the committed files byte for byte.

Commit `doc-snapshot/pages/`, `manifest.json` and `CHANGELOG.md`; `reports/` is gitignored.

---

## 11. Project structure

```
built-in-agent/
├── CLAUDE.md · PR_GUIDELINES.md · README.md · .env.example
├── doc-snapshot/                  # pages/*.md + manifest.json — the doc-sync baseline
├── backend/                       # the Vue Quickstart's Node runtime
│   ├── server.ts                  # ★ Quickstart server.ts + [harness] dispatch
│   ├── agents.ts                  # Quickstart agent, once per doc agent id
│   └── runtimes/
│       ├── threads.ts             # Intelligence quickstart's runtime → /api/copilotkit-threads
│       └── mcp-apps.ts            # MCP Apps' runtime → /api/copilotkit-mcp-apps
└── frontend/                      # create-vue scaffold (TS + router)
    ├── vite.config.ts             # /api proxy → :8200, Tailwind, doc-sync plugin
    ├── harness/                   # Node side of /doc-sync (Vite middleware)
    ├── scripts/
    │   ├── build-doc-catalog.py   # .md snapshot → verified code-block catalog
    │   └── write-doc-files.py     # catalog → verbatim doc files (the only writer of them)
    └── src/
        ├── main.ts                # Quickstart main.ts + router
        ├── HarnessShell.vue       # sidebar vs full-bleed demo
        ├── router/index.ts        # derived from nav-config + src/routes/**
        ├── lib/
        │   ├── nav-config.ts      # ★ routes, doc paths, statuses — nav, headers, /status, doc sync
        │   ├── published.json     # every published block, for "as published" panels
        │   ├── source.ts · highlight.ts · harness-mount.ts · doc-sync/ · doc-sync-state.ts
        ├── components/
        │   ├── harness/           # RouteHeader, DemoFrame, VariantDemo, SourceCode, PublishedCode,
        │   │                      # HarnessProvider (flagged), StandInBadge, Panel, Callout, TryIt …
        │   └── doc-sync/
        ├── pages/                 # /, /status, /doc-sync
        └── routes/<doc path>/
            ├── Notes.vue          # notes + exact source
            └── demo-chat/
                ├── Demo.vue       # [harness] mounts the samples below
                └── App.vue, components/…   # ★ the page's files, verbatim, published names
```

---

## 12. References

Grouped as the Vue doc sidebar groups them.

**Getting Started**: [Quickstart](https://docs.copilotkit.ai/vue)

**Intelligence (used by the Threads routes)**: [Connect Intelligence in 5 minutes](https://docs.copilotkit.ai/vue/intelligence/quickstart)

**Basics**: [Prebuilt Components](https://docs.copilotkit.ai/vue/prebuilt-components) · [Slots](https://docs.copilotkit.ai/vue/custom-look-and-feel/slots) · [Headless UI](https://docs.copilotkit.ai/vue/custom-look-and-feel/headless-ui) · [Programmatic Control](https://docs.copilotkit.ai/vue/programmatic-control) · [Threads Drawer](https://docs.copilotkit.ai/vue/prebuilt-components/copilot-threads-drawer) · [Headless Threads](https://docs.copilotkit.ai/vue/headless-threads) · [Frontend Tools](https://docs.copilotkit.ai/vue/frontend-tools)

**Generative UI**: [Components as Tools](https://docs.copilotkit.ai/vue/generative-ui/tool-based) · [Tool Call Rendering](https://docs.copilotkit.ai/vue/generative-ui/tool-rendering) · [State Rendering](https://docs.copilotkit.ai/vue/generative-ui/state-rendering) · [MCP Apps](https://docs.copilotkit.ai/vue/generative-ui/mcp-apps)

**Interactivity**: [Shared State](https://docs.copilotkit.ai/vue/shared-state) · [Render agent state in your app](https://docs.copilotkit.ai/vue/shared-state/rendering-in-app) · [State Streaming](https://docs.copilotkit.ai/vue/shared-state/streaming) · [Agent Read-Only Context](https://docs.copilotkit.ai/vue/shared-state/agent-readonly) · [HITL Overview](https://docs.copilotkit.ai/vue/human-in-the-loop) · [Pausing the Agent for Input](https://docs.copilotkit.ai/vue/human-in-the-loop/useInterrupt) · [Headless Interrupts](https://docs.copilotkit.ai/vue/human-in-the-loop/headless) · [Governed Action Approval UI](https://docs.copilotkit.ai/vue/human-in-the-loop/governed-actions) · [WebMCP](https://docs.copilotkit.ai/vue/webmcp)

**Agent capabilities**: [Sub-agents](https://docs.copilotkit.ai/vue/multi-agent/subagents)

**In the Vue sidebar but not covered in this pass**: Using these docs · Build with agents · Intelligence (all) · Backend › Runtime / Deployment / Debugging (Inspector) · Learn · Troubleshooting · Community frameworks. Also the sub-pages linked from Prebuilt Components (`/vue/prebuilt-components/chat`, `/sidebar`, `/popup`, `/chat-controls`) and `/vue/custom-look-and-feel/css`.

**External**: [AG-UI protocol](https://ag-ui.com) · [MCP ext-apps](https://github.com/modelcontextprotocol/ext-apps) · [WebMCP spec](https://webmachinelearning.github.io/webmcp/)
