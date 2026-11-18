import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { installSparkleHalftone, installWaveHalftone } from "./lib/halftone.js";
import fontText from "./assets/fonts/ioskeley-mono-500.woff2?url";
import fontBold from "./assets/fonts/ioskeley-mono-700.woff2?url";

// Fetch the site font's two main weights straight away: they're on every screen, and
// waiting for the first piece of text to ask for them would flash the fallback font first
for (const href of [fontText, fontBold]) {
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
