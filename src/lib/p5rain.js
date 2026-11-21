// p5.js and the p5.rain plugin, loaded on first use: they're big, and only the p5.rain
// window and wallpaper need them. both share this one copy.

let loading = null;

/** @returns {Promise<any>} the p5 constructor, with createRain() installed */
export function loadP5Rain() {
  loading ??= Promise.all([import("p5"), import("../vendor/p5.rain.esm.js")])
    .then(([{ default: P5 }, rain]) => {
      rain.install(P5);
      return P5;
    })
    .catch((error) => {
      // let a later attempt try again (e.g. after a flaky connection)
      loading = null;
      throw error;
    });
  return loading;
}

// data-hours over which the rain fades out before the loop's end and back in after
// it restarts, instead of jumping from the newest hour straight back to the oldest
const LOOP_FADE_HOURS = 2.5;

// 0 to 1, dipping to 0 where the field's 7-day loop wraps around
function loopFade(field) {
  const data = field?.data;
  if (!field?.ready || !data?.earliest || !data?.latest) return 1;
  const span = (data.latest - data.earliest) / 3600e3;
  const at = (field.time() - data.earliest) / 3600e3;
  return Math.max(0, Math.min(1, at / LOOP_FADE_HOURS, (span - at) / LOOP_FADE_HOURS));
}

/** sets a canvas's opacity from loopFade(), touching the style only when it changes */
export function applyLoopFade(canvas, field) {
  const opacity = String(Math.round(loopFade(field) * 100) / 100);
  if (canvas.style.opacity !== opacity) canvas.style.opacity = opacity;
}
