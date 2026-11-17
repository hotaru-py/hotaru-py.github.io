<script>
  import { onMount } from "svelte";
  import { fetchStars } from "../lib/githubStars.js";
  import {
    site,
    about,
    experience,
    activities,
    gallery,
    skillCategories,
    liveWork,
    githubProfile,
    projects,
    bookmarks,
    emphasis,
    starLabel,
    schoolName,
    copyrightLine,
  } from "../lib/siteContent.js";
  import { posts, formatPostDate, NO_POSTS } from "../lib/blogPosts.js";

  /**
   * @typedef {Object} Props
   * @property {() => void} onSwitchUser Back to the login screen to pick a style
   */

  /** @type {Props} */
  let { onSwitchUser } = $props();

  const sections = [
    { id: "about", title: "About" },
    { id: "experience", title: "Experience" },
    { id: "projects", title: "Projects" },
    // { id: "gallery", title: "Gallery" }, // hidden while the gallery is empty
    { id: "blog", title: "Blog" },
    { id: "skills", title: "Skills" },
    { id: "links", title: "Links" },
  ];

  // The section being read, highlighted in the sticky bar
  let currentSection = $state("about");
  const currentTitle = $derived(
    sections.find((section) => section.id === currentSection)?.title ?? "",
  );

  // Phones: the sticky bar shows the current section, and a button opens the full list
  let menuOpen = $state(false);
  /** @type {HTMLButtonElement | undefined} */
  let menuButton = $state();
  function closeMenu(refocus = false) {
    menuOpen = false;
    if (refocus) menuButton?.focus();
  }

  // A section picked from the bar stays marked while the page scrolls to it (a short
  // section near the end may never reach the top on its own)
  let holdUntil = 0;
  function pick(id) {
    currentSection = id;
    holdUntil = Date.now() + 1000;
  }

  /** @type {Record<string, number>} */
  let liveStars = $state({});

  onMount(() => {
    // The current section is the last one whose heading has scrolled above a line a
    // third of the way down the screen
    let frame = 0;
    const update = () => {
      frame = 0;
      if (Date.now() < holdUntil) return;
      const line = window.innerHeight / 3;
      let current = sections[0].id;
      for (const { id } of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      currentSection = current;
    };
    const onScroll = () => {
      // Scrolling away from an open list closes it
      if (menuOpen) menuOpen = false;
      frame ||= requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    for (const { stars } of projects) {
      if (!stars) continue;
      fetchStars(stars.repo).then((count) => {
        if (count !== null) liveStars[stars.repo] = count;
      });
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  });
</script>

<!-- Escape closes the phone section list -->
<svelte:window
  onkeydown={(e) => menuOpen && e.key === "Escape" && closeMenu(true)}
/>

<!-- Plain, markdown-flavoured version of the site: text only, top to bottom -->
<div class="simple">
  <main class="page" id="top">
    <header>
      <div class="title-row">
        <h1>
          <span class="mark" aria-hidden="true">{"# "}</span>{site.name} ({about.realName})
        </h1>
        <!-- Switch website styles: back to the picker, from anywhere on the page -->
        <span class="link switch-icon"
          ><span class="bracket" aria-hidden="true">{"[ "}</span><button
            type="button"
            class="icon-button"
            onclick={onSwitchUser}
            aria-label="Switch website style"
            title="Switch website style"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4" />
            </svg></button
          ><span class="bracket" aria-hidden="true">{" ]"}</span></span
        >
      </div>
      <p class="tagline">{site.jobTitle}</p>
    </header>

    <!-- Phones: one line that sticks to the top. It names the section being read, and its
         button opens a list of every section as big tap targets (the tab strip below
         doesn't fit a phone: its last tabs hid off the edge with nothing to show it
         scrolls). -->
    <div class="jump">
      <div class="jump-bar">
        <span class="jump-current" aria-live="polite">
          <span class="mark" aria-hidden="true">{"## "}</span>{currentTitle}
        </span>
        <button
          type="button"
          class="jump-toggle"
          bind:this={menuButton}
          aria-expanded={menuOpen}
          aria-controls="jump-menu"
          onclick={() => (menuOpen = !menuOpen)}
        >
          <span class="bracket" aria-hidden="true">{"[ "}</span>sections {menuOpen
            ? "▴"
            : "▾"}<span class="bracket" aria-hidden="true">{" ]"}</span>
        </button>
      </div>
      {#if menuOpen}
        <!-- Tap outside the list to close it -->
        <button
          type="button"
          class="jump-backdrop"
          tabindex="-1"
          aria-hidden="true"
          onclick={() => closeMenu()}
        ></button>
        <nav id="jump-menu" class="jump-menu" aria-label="Sections">
          {#each sections as section}
            <a
              href="#{section.id}"
              class:current={currentSection === section.id}
              aria-current={currentSection === section.id ? "location" : undefined}
              onclick={() => {
                pick(section.id);
                closeMenu();
              }}
              ><span class="mark" aria-hidden="true"
                >{currentSection === section.id ? "> " : "- "}</span
              >{section.title}</a
            >
          {/each}
        </nav>
      {/if}
    </div>

    <!-- Wider screens: tabs that stick to the top while reading, with the current
         section marked -->
    <nav class="toc" aria-label="Sections">
      {#each sections as section}
        <a
          href="#{section.id}"
          class:current={currentSection === section.id}
          aria-current={currentSection === section.id ? "location" : undefined}
          onclick={() => pick(section.id)}>{section.title}</a
        >
      {/each}
    </nav>

    <section id="about">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>About</h2>
      <p>
        {about.greeting} <span class="muted">({about.pronouns})</span>
      </p>
      <p><strong>{about.tldr}</strong></p>
      {#each about.intro as paragraph}
        <p>{paragraph}</p>
      {/each}
      <ul>
        {#each about.interests as item}
          <li>{@render rich(item)}</li>
        {/each}
      </ul>

      <h3><span class="mark" aria-hidden="true">{"### "}</span>Education</h3>
      <!-- Same list style as Experience: school in bold, details underneath -->
      <ul>
        {#each about.education as entry}
          <li>
            <strong>{schoolName(entry)}</strong>
            {#each entry.lines as line}<br />{line}{/each}
          </li>
        {/each}
      </ul>
    </section>

    <section id="experience">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>Experience</h2>
      <ul>
        {#each experience as job}
          <li>
            <strong>{job.role}</strong><br />
            {#if job.url}{@render link(job.url, job.company)}{:else}{job.company}{/if}
            <span class="muted">({job.period})</span>
          </li>
        {/each}
      </ul>

      <h3>
        <span class="mark" aria-hidden="true">{"### "}</span>Clubs &amp; Activities
      </h3>
      <ul>
        {#each activities as club}
          <li>
            <strong>{club.org}</strong>
            {#each club.roles as entry}<br />{entry.role}
              <span class="muted">({entry.period})</span>{/each}
          </li>
        {/each}
      </ul>
      {@render toTop()}
    </section>

    <section id="projects">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>Projects</h2>

      <details open>
        <summary>
          <span class="mark" aria-hidden="true">{"### "}</span>Live Work
          <span class="muted">({liveWork.length})</span>
        </summary>
        <ul>
          {#each liveWork as live}
            <li>
              <strong>{live.name}</strong>: {live.description}<br />
              {@render link(live.url, live.domain)}
            </li>
          {/each}
        </ul>
      </details>

      <details open>
        <summary>
          <span class="mark" aria-hidden="true">{"### "}</span>Personal Projects
          <span class="muted">({projects.length})</span>
        </summary>
        <ul>
          {#each projects as project}
            <li>
              <strong>{project.name}</strong>: {project.description}
              {#if project.stars}
                <br /><span class="muted"
                  >★ {starLabel(
                    liveStars[project.stars.repo] ?? project.stars.fallback,
                  )}</span
                >
              {/if}
              <br />{@render link(project.link, "View on GitHub")}
            </li>
          {/each}
        </ul>
        <p>{@render link(githubProfile, "More on GitHub")}</p>
      </details>
      {@render toTop()}
    </section>

    <!-- Gallery: hidden while it is empty (see `gallery` in siteContent.js) -->

    <section id="blog">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>Blog</h2>
      {#if posts.length === 0}
        <p class="muted">{NO_POSTS}</p>
      {/if}
      <!-- Each post folds open in place to be read in full -->
      {#each posts as post (post.id)}
        <details class="post">
          <summary>
            <span class="mark" aria-hidden="true">{"### "}</span>{post.title}
            <span class="muted">({formatPostDate(post.date)})</span>
          </summary>
          <p class="muted">{post.summary}</p>
          {#each post.body as paragraph}
            <p>{@render rich(paragraph)}</p>
          {/each}
        </details>
      {/each}
      {@render toTop()}
    </section>

    <section id="skills">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>Skills</h2>
      {#each skillCategories as category}
        <h3>
          <span class="mark" aria-hidden="true">{"### "}</span>{category.name}
        </h3>
        <p>{category.items.join(" · ")}</p>
      {/each}
      {@render toTop()}
    </section>

    <section id="links">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>Links</h2>
      <ul>
        {#each bookmarks as bookmark}
          <li>{@render link(bookmark.url, bookmark.name)}</li>
        {/each}
      </ul>
    </section>

    <footer>
      <!-- A little wave goodbye; hidden from screen readers, which would spell it out -->
      <p aria-hidden="true">(^_^)/</p>
      <p class="rule" aria-hidden="true">---</p>
      <p>{@render switchButton()}</p>
      <p class="muted">{copyrightLine()}</p>
    </footer>
  </main>
</div>

{#snippet link(href, label, external = !href.startsWith("#"))}<span class="link"
    ><span class="bracket" aria-hidden="true">{"[ "}</span><a
      {href}
      target={external && !href.startsWith("mailto:") ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}>{label}</a
    ><span class="bracket" aria-hidden="true">{" ]"}</span></span
  >{/snippet}

{#snippet toTop()}<p class="to-top">{@render link("#top", "↑ Back to top", false)}</p>{/snippet}

{#snippet switchButton()}<span class="link"
    ><span class="bracket" aria-hidden="true">{"[ "}</span><button
      type="button"
      onclick={onSwitchUser}>Switch website styles</button
    ><span class="bracket" aria-hidden="true">{" ]"}</span></span
  >{/snippet}

{#snippet rich(text)}{#each emphasis(text) as part}{#if part.strong}<strong
        >{part.text}</strong
      >{:else}{part.text}{/if}{/each}{/snippet}

<style>
  :global(html[data-mode="simple"]) {
    scroll-behavior: smooth;
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html[data-mode="simple"]) {
      scroll-behavior: auto;
    }
  }

  .simple {
    --bg: var(--color-moss-100);
    --text: var(--color-moss-950);
    --muted: var(--color-moss-700);
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-terminal);
    font-size: 15px;
    line-height: 1.7;
  }

  .simple ::selection {
    background: var(--color-moss-300);
  }

  .page {
    max-width: 72ch;
    margin: 0 auto;
    padding: 56px 20px 64px;
  }

  h1,
  h2,
  h3 {
    margin: 0;
    font-weight: 700;
    line-height: 1.35;
  }

  h1 {
    font-size: 22px;
  }

  /* The title with the switch icon at the right end of its row */
  .title-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .title-row h1 {
    min-width: 0;
  }

  .switch-icon {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    /* Lines the 44px tap target up with the title's first line */
    margin-top: -9px;
  }

  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
  }

  .icon-button svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  h2 {
    font-size: 18px;
    margin-top: 48px;
  }

  h3 {
    font-size: 15px;
    margin-top: 24px;
  }

  p,
  ul {
    margin: 12px 0 0;
  }

  .mark,
  .muted,
  .bracket {
    color: var(--muted);
  }

  .tagline {
    margin-top: 4px;
    color: var(--muted);
  }

  /* Sticky section bar: scrolls sideways on narrow screens rather than wrapping */
  .toc {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    gap: 2ch;
    margin: 20px -20px 0;
    padding: 10px 20px;
    overflow-x: auto;
    scrollbar-width: none;
    background: var(--bg);
    border-bottom: 1px dashed var(--muted);
    white-space: nowrap;
  }

  .toc::-webkit-scrollbar {
    display: none;
  }

  .toc a {
    color: var(--muted);
    font-weight: 700;
  }

  .toc a.current {
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  /* --- Phone bar: the current section, and a button for the full list --- */
  .jump {
    display: none;
  }

  @media (max-width: 540px) {
    /* The tab strip needs about 480px; below that the bar and list replace it */
    .toc {
      display: none;
    }

    .jump {
      display: block;
      position: sticky;
      top: 0;
      z-index: 2;
      margin: 20px -20px 0;
    }

    .jump-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      min-height: 48px;
      padding: 0 20px;
      background: var(--bg);
      border-bottom: 1px dashed var(--muted);
    }

    .jump-current {
      min-width: 0;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .jump-toggle {
      flex-shrink: 0;
      min-height: 48px;
      padding: 0 4px;
      white-space: nowrap;
    }

    /* Dims the page behind the list; sits under the bar and list but over the page */
    .jump-backdrop {
      position: fixed;
      inset: 0;
      z-index: -1;
      width: 100%;
      background: color-mix(in srgb, var(--text) 28%, transparent);
      cursor: default;
    }

    /* Floats over the page under the bar rather than pushing it down: growing the bar
       made the browser's scroll anchoring shift the page, which closed the list */
    .jump-menu {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      display: flex;
      flex-direction: column;
      background: var(--bg);
      border-bottom: 1px dashed var(--muted);
    }

    .jump-menu a {
      display: flex;
      align-items: center;
      gap: 1ch;
      min-height: 52px;
      padding: 0 20px;
      color: var(--muted);
    }

    .jump-menu a + a {
      border-top: 1px dashed color-mix(in srgb, var(--muted) 45%, transparent);
    }

    .jump-menu a.current {
      color: var(--text);
    }

    .jump-menu .mark {
      white-space: pre;
    }
  }

  @media (prefers-reduced-motion: no-preference) and (max-width: 540px) {
    .jump-menu {
      animation: jump-in 0.14s ease-out;
    }

    @keyframes jump-in {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
    }
  }

  /* Jumps land below the sticky bar, not under it */
  section {
    scroll-margin-top: 56px;
  }

  /* Folding "### " headings */
  details {
    margin-top: 20px;
  }

  summary {
    font-weight: 700;
    cursor: pointer;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::after {
    content: " +";
    color: var(--muted);
  }

  details[open] > summary::after {
    content: " −";
  }

  .post p {
    margin-left: 2ch;
  }

  .to-top {
    margin-top: 20px;
    font-size: 13px;
  }

  /* Markdown-style "- " bullets */
  ul {
    list-style: none;
    padding: 0;
  }

  li {
    position: relative;
    padding-left: 2ch;
  }

  li + li {
    margin-top: 6px;
  }

  li::before {
    content: "-";
    position: absolute;
    left: 0;
    color: var(--muted);
  }

  .link {
    white-space: nowrap;
  }

  a,
  button {
    color: var(--text);
    font: inherit;
    font-weight: 700;
    text-decoration: none;
  }

  button {
    padding: 0;
    border: none;
    background: none;
    cursor: pointer;
  }

  a:hover,
  button:hover,
  a:focus-visible,
  button:focus-visible {
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  a:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--muted);
    outline-offset: 2px;
  }

  footer {
    margin-top: 48px;
  }

  .rule {
    color: var(--muted);
  }

  @media (max-width: 480px) {
    .simple {
      font-size: 14px;
    }

    .page {
      padding-top: 40px;
    }

    /* Long link labels in lists may wrap on narrow screens; the short section links
       above stay whole so a bracket never ends up alone on a line */
    li .link {
      white-space: normal;
    }
  }
</style>
