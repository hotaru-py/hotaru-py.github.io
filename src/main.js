import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { installSparkleHalftone, installWaveHalftone } from "./lib/halftone.js";
import obelMono from "./assets/fonts/obel-mono.woff2?url";

// Fetch the site font straight away: it's on every screen, and waiting for the first
// piece of text to ask for it would flash the fallback font first
const preload = document.createElement("link");
preload.rel = "preload";
preload.as = "font";
preload.type = "font/woff2";
preload.crossOrigin = "anonymous";
preload.href = obelMono;
document.head.append(preload);

installSparkleHalftone();
installWaveHalftone();

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;
