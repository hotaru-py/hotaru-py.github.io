// windows mount their content on open, so their images are warmed up front instead of
// popping in mid-animation

/** kept so the decoded images aren't thrown away before they're used */
const warmed = [];

/** @param {string[]} urls */
export function preloadImages(urls) {
  for (const url of urls) {
    const image = new Image();
    image.src = url;
    image.decode().catch(() => {
      // a broken image shows up broken in the window anyway; nothing to do here
    });
    warmed.push(image);
  }
}
