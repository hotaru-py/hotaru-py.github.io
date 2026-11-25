import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
// applies the chosen wallpaper's colour theme before anything is drawn
import "./lib/wallpaper.svelte.js";
import { installSparkleHalftone, installWaveHalftone } from "./lib/halftone.js";
import uiText from "./assets/fonts/google-sans-500.woff2?url";
import uiBold from "./assets/fonts/google-sans-700.woff2?url";
import monoText from "./assets/fonts/geist-mono-500.woff2?url";
import monoBold from "./assets/fonts/geist-mono-700.woff2?url";

// preload the first screen's font so it doesn't flash the fallback: Google Sans for a
// returning desktop visitor, Geist Mono for the login screen and Simple Mode
let returningToDesktop = false;
try {
  returningToDesktop = localStorage.getItem("site-mode") === "full";
} catch {
  // storage unavailable: they'll see the login screen
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
