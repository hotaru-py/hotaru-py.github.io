// the favicon is the loader's logo in the current colours (app.css --logo-fill-*):
// the same top-heavy gradient, without the grain, which is lost at tab size.
// public/favicon.svg is the same logo in Bloom (the default), for before this runs
import { LOGO_PATH, LOGO_VIEWBOX } from "./logo.js";

/** the logo as an SVG document filled with a three-stop gradient */
export function faviconSvg([from, mid, to]) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${LOGO_VIEWBOX}">` +
    `<defs><linearGradient id="g" x1="0.25" y1="0" x2="0.75" y2="1">` +
    `<stop offset="0" stop-color="${from}"/><stop offset="0.45" stop-color="${mid}"/>` +
    `<stop offset="1" stop-color="${to}"/></linearGradient></defs>` +
    `<path d="${LOGO_PATH}" fill="url(#g)"/></svg>`
  );
}

/** points the page's icon at the logo in the colours now on the root element */
export function updateFavicon() {
  const style = getComputedStyle(document.documentElement);
  const stops = ["from", "mid", "to"].map((k) =>
    style.getPropertyValue(`--logo-fill-${k}`).trim(),
  );
  if (stops.some((c) => !c)) return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.append(link);
  }
  link.type = "image/svg+xml";
  link.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg(stops))}`;
}
