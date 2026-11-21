// works out an hour's motion field off the main thread (10-35ms on it, a visible hitch)
import { computeMotion } from "../vendor/p5.rain.esm.js";

self.onmessage = ({ data: { key, a, b, span } }) => {
  const { vx, vy } = computeMotion(a, b, span);
  self.postMessage({ key, vx, vy }, [vx.buffer, vy.buffer]);
};
