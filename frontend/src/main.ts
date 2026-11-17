import { createApp } from "vue";
import App from "./HarnessShell.vue"; // [harness] Quickstart: `import App from "./App.vue"` — each doc App.vue lives under src/routes/
import "@copilotkit/vue/styles.css";

import "./harness.css"; // [harness] Tailwind for the harness chrome
import router from "./router"; // [harness] one route per doc page

// Quickstart: createApp(App).mount("#app");
createApp(App).use(router).mount("#app");
