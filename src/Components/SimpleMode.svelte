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
    const onScroll = () => (frame ||= requestAnimationFrame(update));
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

<!-- Plain, markdown-flavoured version of the site: text only, top to bottom -->
<div class="simple">
  <main class="page" id="top">
    <header>
      <h1>
        <span class="mark" aria-hidden="true">{"# "}</span>{site.name} ({about.realName})
      </h1>
      <p class="tagline">{site.jobTitle}</p>
    </header>

    <!-- Sticks to the top while reading, with the current section marked -->
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
      <p class="muted">© {new Date().getFullYear()} {site.name}</p>
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
    font-family:
      "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas,
      monospace;
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
