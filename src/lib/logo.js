// The logo geometry is read from the artwork file, so replacing src/assets/logo-mark.svg
// updates the loader and the start button together
import markSvg from "../assets/logo-mark.svg?raw";

const path = markSvg.match(/\sd="([^"]+)"/)?.[1];
const box = markSvg.match(/viewBox="([^"]+)"/)?.[1];
if (!path || !box) {
  throw new Error("logo-mark.svg must contain a viewBox and a single <path d>");
}

export const LOGO_PATH = path;
export const LOGO_VIEWBOX = box;

const [, , width, height] = box.split(/\s+/).map(Number);
export const LOGO_ASPECT = width / height;
