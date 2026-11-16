// Which blog post the Blog app shows (null = the list). Shared so the phone's blog
// widget can open the app straight onto a post, even when it's already open.
export const blogNav = $state({ post: null });
