// Blog posts, newest first. Free to read on the site and in Simple Mode, but kept out
// of llms.txt and the crawler copy: staticSite.js doesn't import this file.
//
// `body` is a list of paragraphs; text may use **double asterisks** for emphasis.
// What the Blog window calls itself (the app and its icon are still just "Blog")
export const BLOG_TITLE = "hotaru's memdump";

// Shown wherever the blog is (app, widgets, Simple Mode) while there are no posts
export const NO_POSTS = "This is where I'd put my blog posts, IF I HAD ANY!!!";

// Newest first. `date` is ISO (YYYY-MM-DD). Lists show the start of the post itself (see
// `preview`), so there is no separate blurb to write.
export const posts = [
  {
    id: "not-my-first-post",
    title: "(Not my) first post!",
    date: "2026-11-18",
    body: [
      "This is technically not my first blog post, since I had a blog back in high school (none of the posts from which exist anymore). I do have them backed up in a text file on my PC back at home, and it had some fun outlook on things from my pov then, iirc. Might try curating some good ones from there when I get back. 99% chance you won't see it.",
      "New content incoming though. Eventually.",
    ],
  },
];

/** The start of a post, plain: lists clamp it to a couple of lines with an ellipsis */
export function preview(post) {
  return post.body[0].replace(/\*\*/g, "");
}

/** The newest `count` posts */
export function latestPosts(count) {
  return posts.slice(0, count);
}

/** "Nov 18, 2026" */
export function formatPostDate(iso) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
