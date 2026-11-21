import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { installSparkleHalftone, installWaveHalftone } from "./lib/halftone.js";
import uiText from "./assets/fonts/google-sans-500.woff2?url";
import uiBold from "./assets/fonts/google-sans-700.woff2?url";
import monoText from "./assets/fonts/geist-mono-500.woff2?url";
import monoBold from "./assets/fonts/geist-mono-700.woff2?url";

// Fetch the first screen's font straight away, in its two main weights, so the first
// piece of text doesn't flash the fallback font. A visitor who last used the desktop
// comes back to it (Google Sans); anyone else starts on the login screen or Simple Mode
// (Geist Mono).
let returningToDesktop = false;
try {
  returningToDesktop = localStorage.getItem("site-mode") === "full";
} catch {
  // Storage unavailable: they'll see the login screen
}
for (const href of returningToDesktop ? [uiText, uiBold] : [monoText, monoBold]) {
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.as = "font";
  preload.type = "font/woff2";
  preload.crossOrigin = "anonymous";
  preload.href = href;
  document.head.append(preload);
}

installSparkleHalftone();
installWaveHalftone();

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;
