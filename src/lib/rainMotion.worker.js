// Works out p5.rain's motion field for an hour off the main thread. On the page it
// takes ~10ms in Chrome and up to ~35ms in Firefox, once per data-hour (every half
// second), which showed up as a hitch; here it is computed ahead of time instead.
import { computeMotion } from "../vendor/p5.rain.esm.js";

self.onmessage = ({ data: { key, a, b, span } }) => {
  const { vx, vy } = computeMotion(a, b, span);
  self.postMessage({ key, vx, vy }, [vx.buffer, vy.buffer]);
};
