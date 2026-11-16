// Blog posts, newest first. Free to read on the site and in Simple Mode, but kept out
// of llms.txt and the crawler copy: staticSite.js doesn't import this file.
//
// `body` is a list of paragraphs; text may use **double asterisks** for emphasis.
// Shown wherever the blog is (app, widgets, Simple Mode) while there are no posts
export const NO_POSTS = "This is where I'd put my blog posts, IF I HAD ANY!!!";

// Newest first, e.g.
// {
//   id: "first-post",
//   title: "First post",
//   date: "2026-11-17",
//   summary: "One line for the list and the widget.",
//   body: ["A paragraph.", "Another, with **bold** bits."],
// },
export const posts = [];

/** The newest `count` posts */
export function latestPosts(count) {
  return posts.slice(0, count);
}

/** "16 Nov 2026" */
export function formatPostDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
