// p5.js and the p5.rain plugin, loaded on first use: they're big, and only the p5.rain
// window and wallpaper need them. Both share this one copy.

let loading = null;

/** @returns {Promise<any>} the p5 constructor, with createRain() installed */
export function loadP5Rain() {
  loading ??= Promise.all([import("p5"), import("../vendor/p5.rain.esm.js")])
    .then(([{ default: P5 }, rain]) => {
      rain.install(P5);
      return P5;
    })
    .catch((error) => {
      // Let a later attempt try again (e.g. after a flaky connection)
      loading = null;
      throw error;
    });
  return loading;
}
