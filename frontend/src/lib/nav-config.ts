/**
 * The nav, the route headers, the /status table and the doc sync all read from
 * here, so a doc page and its implementation status are described exactly once.
 *
 * Route paths mirror the doc URLs under https://docs.copilotkit.ai/vue, minus
 * the `/vue` prefix. Groups and folders mirror that sidebar's separators and
 * folders as of the doc sync recorded in doc-snapshot/manifest.json.
 *
 * Pure TypeScript, no Vue imports: the doc-sync Vite plugin imports this file
 * on the Node side too.
 *
 * Statuses reflect code inspection, `vue-tsc` and `vite build` only — no route
 * has been driven against a live model yet (README §8).
 */
export const DOCS_ROOT = "https://docs.copilotkit.ai/vue";

export type RouteStatus = "working" | "partial" | "reference" | "broken" | "not-started";

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};

export interface RouteMeta {
  path: string;
  title: string;
  /** Path under docs.copilotkit.ai, e.g. `/vue/frontend-tools`. */
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  /** The doc sidebar folder the page sits in, under its group's separator. */
  folder?: string;
  /** Owns a live surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Harness-only page, not a doc page (no doc-sync target). */
  harness?: boolean;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/vue",
        summary: "What this harness covers, how the pieces fit, and the agent roster.",
        status: "reference",
        statusNote: "Landing page — orientation and doc-drift summary.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        title: "Quickstart",
        docPath: "/vue",
        summary:
          "A Vite Vue app with CopilotChat under CopilotKitProvider, talking to a separate Node Copilot Runtime that registers a BuiltInAgent as `default`.",
        status: "working",
      },
    ],
  },
  {
    title: "Basics",
    routes: [
      {
        path: "/prebuilt-components",
        hasDemo: true,
        folder: "Chat",
        title: "Prebuilt Components",
        docPath: "/vue/prebuilt-components",
        summary:
          "The drop-in CopilotChat, as the page's only published code sample, against agent `my-agent`.",
        status: "working",
        statusNote:
          "CopilotSidebar, CopilotPopup and useConfigureSuggestions are named but have no code on this page.",
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        folder: "Chat › Custom Look and Feel",
        title: "Slots",
        docPath: "/vue/custom-look-and-feel/slots",
        summary:
          "Vue named and scoped slots on CopilotChat: welcome screen, assistant toolbar, disclaimer, class/props on leaves, custom components, nested slots, labels.",
        status: "partial",
        statusNote:
          "Most samples are template fragments; imports were added to mount them. CustomMessageView and CustomToolbarAction are flagged stand-ins. The disclaimer sample never shows its disclaimer (doc bug, README §9).",
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        folder: "Chat › Custom Look and Feel",
        title: "Headless UI",
        docPath: "/vue/custom-look-and-feel/headless-ui",
        summary:
          "A chat with no CopilotKit chrome built from useAgent + useCopilotKit, and the complete variant composed from public message leaves.",
        status: "working",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        folder: "Chat › Custom Look and Feel",
        title: "Programmatic Control",
        docPath: "/vue/programmatic-control",
        summary:
          "Run and stop agent `sales` from buttons with agent.addMessage + copilotkit.runAgent, no chat UI.",
        status: "working",
        statusNote:
          "The page renders no output, so the default sample adds a CopilotChat on the same agent (harness, on request). The agent.subscribe sample is a fragment and is shown, not mounted.",
      },
      {
        path: "/prebuilt-components/copilot-threads-drawer",
        hasDemo: true,
        folder: "Chat › Threads",
        title: "Threads Drawer",
        docPath: "/vue/prebuilt-components/copilot-threads-drawer",
        summary:
          "CopilotThreadsDrawer beside CopilotChat under a shared CopilotChatConfigurationProvider, plus the toolbar-button, controlled and customization samples.",
        status: "partial",
        statusNote:
          "Intelligence wired per the Vue Intelligence quickstart, with its fixed local-demo identity. Needs CPK_INTELLIGENCE_API_KEY; not yet verified against a live project (README §9).",
      },
      {
        path: "/headless-threads",
        hasDemo: true,
        folder: "Chat › Threads",
        title: "Headless Threads",
        docPath: "/vue/headless-threads",
        summary:
          "useThreads with a hand-built list — select, rename, archive, delete — beside CopilotChat.",
        status: "partial",
        statusNote:
          "Same Intelligence runtime as the Threads Drawer. Needs CPK_INTELLIGENCE_API_KEY; not yet verified against a live project (README §9).",
      },
      {
        path: "/frontend-tools",
        hasDemo: true,
        title: "Frontend Tools",
        docPath: "/vue/frontend-tools",
        summary:
          "useFrontendTool registers `filter_incidents`; the agent calls it and the handler updates a Vue ref in the browser.",
        status: "working",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/tool-based",
        hasDemo: true,
        folder: "Controlled",
        title: "Components as Tools",
        docPath: "/vue/generative-ui/tool-based",
        summary:
          "useComponent exposes WeatherCard to the agent as `show_weather`; the agent's arguments become the card's props.",
        status: "working",
      },
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        folder: "Controlled",
        title: "Tool Call Rendering",
        docPath: "/vue/generative-ui/tool-rendering",
        summary:
          "useDefaultRenderTool (zero-config and custom catch-all) and a per-tool useRenderTool for `get_weather`.",
        status: "broken",
        statusNote:
          "The renderers mount, but no Vue page publishes a backend tool for the built-in agent, so there is no tool call to render (README §9).",
      },
      {
        path: "/generative-ui/state-rendering",
        hasDemo: true,
        folder: "Controlled",
        title: "State Rendering",
        docPath: "/vue/generative-ui/state-rendering",
        summary:
          "ResearchProgress reads agent `researcher`'s state through useAgent and renders status, progress and draft.",
        status: "broken",
        statusNote:
          "No backend is published for the built-in agent, so nothing ever writes the state this component reads (README §9).",
      },
      {
        path: "/generative-ui/mcp-apps",
        hasDemo: true,
        folder: "Open-ended",
        title: "MCP Apps",
        docPath: "/vue/generative-ui/mcp-apps",
        summary:
          "mcpApps.servers on the runtime; the built-in MCPAppsActivityRenderer draws the server's UI resource in a sandboxed iframe.",
        status: "partial",
        statusNote:
          "Placeholder server URL replaced with the page's own localhost:3101 example; needs `npm run mcp:apps` in backend/. Runs on its own runtime (README §9).",
      },
    ],
  },
  {
    title: "Interactivity",
    routes: [
      {
        path: "/shared-state",
        hasDemo: true,
        folder: "Shared state",
        title: "Shared State",
        docPath: "/vue/shared-state",
        summary:
          "Read agent `workspace`'s state with useAgent and write it back with setState from a button.",
        status: "partial",
        statusNote:
          "The two published SharedWorkspace.vue fragments are merged into one file. The agent starts with empty state (README §9).",
      },
      {
        path: "/shared-state/rendering-in-app",
        hasDemo: true,
        folder: "Shared state",
        title: "Render agent state in your app",
        docPath: "/vue/shared-state/rendering-in-app",
        summary:
          "A canvas outside the chat seeds and renders `default`'s state; the chat and the canvas share one agent.",
        status: "working",
        statusNote: "The toggleItem write-back is a fragment and is shown, not wired.",
      },
      {
        path: "/shared-state/streaming",
        hasDemo: true,
        folder: "Shared state",
        title: "State Streaming",
        docPath: "/vue/shared-state/streaming",
        summary:
          "StreamingDocument renders agent `writer`'s `document` state with a LIVE indicator while the run streams.",
        status: "broken",
        statusNote:
          "The streaming mapping is backend-only and no Vue page publishes it for the built-in agent (README §9).",
      },
      {
        path: "/shared-state/agent-readonly",
        hasDemo: true,
        folder: "Shared state",
        title: "Agent Read-Only Context",
        docPath: "/vue/shared-state/agent-readonly",
        summary:
          "useAgentContext publishes the active workspace id to the agent as read-only context.",
        status: "working",
      },
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        folder: "Human-in-the-loop",
        title: "HITL Overview",
        docPath: "/vue/human-in-the-loop",
        summary:
          "useHumanInTheLoop registers `schedule_meeting`; the agent's call renders a time picker that answers with `respond`.",
        status: "partial",
        statusNote:
          "TimePickerCard.vue is never published — a flagged stand-in is used. The page has no App.vue; a flagged chat wrapper mounts it.",
      },
      {
        path: "/human-in-the-loop/useInterrupt",
        hasDemo: true,
        folder: "Human-in-the-loop",
        title: "Pausing the Agent for Input",
        docPath: "/vue/human-in-the-loop/useInterrupt",
        summary:
          "useInterrupt with renderInChat: false — an Approve / Cancel panel for runtime interrupts.",
        status: "broken",
        statusNote:
          "BuiltInAgent never emits interrupts, so the panel never appears. MeetingChat.vue is never published (flagged stand-in).",
      },
      {
        path: "/human-in-the-loop/headless",
        hasDemo: true,
        folder: "Human-in-the-loop",
        title: "Headless Interrupts",
        docPath: "/vue/human-in-the-loop/headless",
        summary: "Resolving interrupts from a panel with no chat mounted.",
        status: "broken",
        statusNote:
          "The page publishes only App.vue; HeadlessInterruptPanel.vue is a flagged stand-in, and BuiltInAgent never interrupts.",
      },
      {
        path: "/human-in-the-loop/governed-actions",
        hasDemo: true,
        folder: "Human-in-the-loop",
        title: "Governed Action Approval UI",
        docPath: "/vue/human-in-the-loop/governed-actions",
        summary:
          "An approval card for `approve_governed_action` that auto-resolves allow/deny verdicts and asks on require_approval.",
        status: "partial",
        statusNote:
          "The useHumanInTheLoop half runs. The useInterrupt half never fires (no interrupts), and executeSideEffect is never defined.",
      },
      {
        path: "/webmcp",
        hasDemo: true,
        title: "WebMCP",
        docPath: "/vue/webmcp",
        summary:
          "A frontend tool mirrored to document.modelContext, via useFrontendTool and via CopilotKitCore directly.",
        status: "partial",
        statusNote:
          "Demo shows only OrderSearch.vue with a flagged searchOrders stand-in (user's choice); calls return sample orders. As published, searchOrders is never defined and every call errors (README §9.9). webmcp.ts is shown, not mounted.",
      },
    ],
  },
  {
    title: "Agent capabilities",
    routes: [
      {
        path: "/multi-agent/subagents",
        title: "Sub-agents",
        docPath: "/vue/multi-agent/subagents",
        summary:
          "Supervisor → research / writing / critique sub-agents with a live delegation log.",
        status: "broken",
        statusNote:
          "The rendered page publishes no code at all for the built-in agent — no backend and no Vue delegation log. Nothing to implement (README §9).",
      },
    ],
  },
  {
    title: "Harness",
    routes: [
      {
        path: "/status",
        title: "Status overview",
        docPath: "/vue",
        summary: "Every route, its doc page and its status in one table.",
        status: "reference",
        harness: true,
      },
      {
        path: "/doc-sync",
        title: "Doc sync",
        docPath: "/vue",
        summary:
          "Re-fetch the markdown behind every tracked doc page, diff it against doc-snapshot/, and replace the snapshot.",
        status: "reference",
        harness: true,
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

/** Doc routes only — what doc sync fetches. */
export const DOC_ROUTES: RouteMeta[] = ALL_ROUTES.filter((r) => !r.harness);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}
