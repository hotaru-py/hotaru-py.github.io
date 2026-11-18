<script>
  import {
    posts,
    formatPostDate,
    preview,
    NO_POSTS,
    BLOG_TITLE,
  } from "../lib/blogPosts.js";
  import { blogNav } from "../lib/blogNav.svelte.js";
  import { emphasis } from "../lib/siteContent.js";
  import { playSound } from "../lib/sounds.js";
  import { tactile } from "../lib/tactile.js";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";

  /**
   * @typedef {Object} Props
   * @property {boolean} [isMobile]
   */

  /** @type {Props} */
  let { isMobile = false } = $props();

  // The open post lives in blogNav, so the phone's blog widget can open one directly
  const post = $derived(posts.find((p) => p.id === blogNav.post) ?? null);

  // A post slides in from the right; the list, from the left
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const slide = (from) => ({
    x: reduceMotion ? 0 : from,
    duration: reduceMotion ? 0 : 220,
    easing: cubicOut,
  });

  function open(id) {
    blogNav.post = id;
    playSound("tactile", 0.1);
  }

  function back() {
    blogNav.post = null;
    playSound("tactile", 0.1);
  }
</script>

<div class="blog" class:mobile={isMobile}>
  {#if post}
    <article class="post" in:fly={slide(28)}>
      <button type="button" class="back" onclick={back}>← All posts</button>
      <h2 class="post-title">{post.title}</h2>
      <p class="date">{formatPostDate(post.date)}</p>
      {#each post.body as paragraph}
        <p class="paragraph">
          {#each emphasis(paragraph) as part}{#if part.strong}<strong
                >{part.text}</strong
              >{:else}{part.text}{/if}{/each}
        </p>
      {/each}
    </article>
  {:else}
    <div in:fly={slide(-28)}>
      <h2 class="title">{BLOG_TITLE}</h2>
      {#if posts.length === 0}
        <p class="empty">{NO_POSTS}</p>
      {:else}
        <ul class="list">
          {#each posts as entry (entry.id)}
            <li>
              <button
                type="button"
                class="entry"
                onclick={() => open(entry.id)}
                use:tactile
              >
                <span class="entry-title">{entry.title}</span>
                <span class="date">{formatPostDate(entry.date)}</span>
                <span class="summary">{preview(entry)}</span>
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {/if}
</div>

<style>
  .blog {
    color: var(--color-ink);
  }

  .title {
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: var(--ink-border);
    font-size: 20px;
    font-weight: 700;
  }

  .list {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .list li + li {
    margin-top: 10px;
  }

  .entry {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 100%;
    padding: 12px 14px;
    border: var(--ink-border);
    border-radius: 12px;
    background: var(--color-paper);
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .entry:hover {
    background: var(--color-moss-100);
  }

  .entry-title {
    font-size: 16px;
    font-weight: 700;
  }

  .date {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-ink-muted);
  }

  .summary {
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .back {
    margin-bottom: 14px;
    padding: 4px 10px;
    border: 1.5px solid var(--color-ink);
    border-radius: 999px;
    background: var(--color-paper);
    color: var(--color-ink);
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .back:hover {
    background: var(--color-moss-100);
  }

  .post {
    max-width: 62ch;
  }

  .post-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    line-height: 1.25;
  }

  .post .date {
    display: block;
    margin: 6px 0 18px;
  }

  .paragraph {
    margin: 0 0 14px;
    font-size: 15px;
    line-height: 1.7;
    color: var(--color-ink-soft);
  }

  .paragraph strong {
    color: var(--color-ink);
  }

  .empty {
    color: var(--color-ink-muted);
  }
</style>
