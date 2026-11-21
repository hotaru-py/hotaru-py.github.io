<script>
  import {
    posts,
    formatPostDate,
    preview,
    NO_POSTS,
  } from "../../lib/blogPosts.js";

  /**
   * Home-screen widget: the newest posts in a list that scrolls on its own, then a
   * button for the full blog.
   * @typedef {Object} Props
   * @property {(postId: string) => void} onOpenPost
   * @property {() => void} onViewAll
   */

  /** @type {Props} */
  let { onOpenPost, onViewAll } = $props();

  const entries = posts.slice(0, 5);
</script>

<section class="widget" aria-label="Blog">
  <h2 class="heading">Blog</h2>
  <div class="scroller">
    {#if entries.length === 0}
      <p class="empty">{NO_POSTS}</p>
    {/if}
    <ul>
      {#each entries as post (post.id)}
        <li>
          <button type="button" class="post" onclick={() => onOpenPost(post.id)}>
            <span class="title">{post.title}</span>
            <span class="date">{formatPostDate(post.date)}</span>
            <span class="summary">{preview(post)}</span>
          </button>
        </li>
      {/each}
    </ul>
    <button type="button" class="view-all" onclick={onViewAll}>View all →</button>
  </div>
</section>

<style>
  .widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    padding: 12px 12px 0;
    border: var(--ink-border);
    border-radius: 20px;
    background: var(--color-paper);
    box-shadow: var(--ink-shadow);
    color: var(--color-ink);
    overflow: hidden;
  }

  .heading {
    margin: 0 4px 8px;
    font-size: 15px;
    font-weight: 700;
  }

  /* Its own scroller: swiping up and down here scrolls the posts, sideways still
     changes page */
  .scroller {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-bottom: 12px;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li + li {
    border-top: 1.5px solid var(--color-moss-200);
  }

  .post {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 10px 4px;
    border: none;
    background: none;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .post:active {
    background: var(--color-moss-100);
  }

  .title {
    font-size: 15px;
    font-weight: 700;
  }

  .date {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-ink-muted);
  }

  .summary {
    font-size: 13px;
    line-height: 1.4;
    color: var(--color-ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .empty {
    margin: 4px 4px 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-ink-soft);
  }

  .view-all {
    display: block;
    width: 100%;
    margin-top: 8px;
    padding: 9px;
    border: var(--ink-border);
    border-radius: 12px;
    background: var(--color-accent);
    color: var(--color-ink);
    font: inherit;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
  }

  .view-all:active {
    transform: translate(1px, 1px);
  }
</style>
