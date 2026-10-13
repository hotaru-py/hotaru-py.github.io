// Windows only mount their content when opened, so their images would otherwise start
// downloading at that moment and pop in mid-animation. Warming them up front means they
// come straight out of the browser's cache, already decoded.

/** Kept so the decoded images aren't thrown away before they're used */
const warmed = [];

/** @param {string[]} urls */
export function preloadImages(urls) {
  for (const url of urls) {
    const image = new Image();
    image.src = url;
    image.decode().catch(() => {
      // A broken image shows up broken in the window anyway; nothing to do here
    });
    warmed.push(image);
  }
}
