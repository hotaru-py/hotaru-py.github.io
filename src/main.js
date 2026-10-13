import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";
import { installSparkleHalftone, installWaveHalftone } from "./lib/halftone.js";

installSparkleHalftone();
installWaveHalftone();

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;
