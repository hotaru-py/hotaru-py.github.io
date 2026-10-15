<script>
  import { onMount } from "svelte";
  import { fetchStars } from "../lib/githubStars.js";
  import {
    site,
    about,
    experience,
    skillCategories,
    liveWork,
    githubProfile,
    projects,
    bookmarks,
    emphasis,
    starLabel,
    schoolName,
  } from "../lib/siteContent.js";

  /**
   * @typedef {Object} Props
   * @property {() => void} onSwitchUser Back to the login screen to pick a style
   */

  /** @type {Props} */
  let { onSwitchUser } = $props();

  const sections = [
    { id: "about", title: "About" },
    { id: "experience", title: "Experience" },
    { id: "skills", title: "Skills" },
    { id: "work", title: "Work" },
    { id: "links", title: "Links" },
  ];

  /** @type {Record<string, number>} */
  let liveStars = $state({});

  onMount(() => {
    for (const { stars } of projects) {
      if (!stars) continue;
      fetchStars(stars.repo).then((count) => {
        if (count !== null) liveStars[stars.repo] = count;
      });
    }
  });
</script>

<!-- Plain, markdown-flavoured version of the site: text only, top to bottom -->
<div class="simple">
  <main class="page">
    <header>
      <h1>
        <span class="mark" aria-hidden="true">{"# "}</span>{site.name} ({site.handle})
      </h1>
      <p class="tagline">{site.jobTitle}</p>
      <nav aria-label="Sections">
        {#each sections as section, i}{#if i > 0}{" "}{/if}{@render link(
            `#${section.id}`,
            section.title,
            false,
          )}{/each}
      </nav>
    </header>

    <section id="about">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>About</h2>
      <p>
        {about.greeting} <span class="muted">({about.pronouns})</span>
      </p>
      {#each about.intro as paragraph}
        <p>{paragraph}</p>
      {/each}
      <ul>
        {#each about.interests as item}
          <li>{@render rich(item)}</li>
        {/each}
      </ul>
      <p>{about.outro}</p>

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
            {@render link(job.url, job.company)}
            <span class="muted">({job.period})</span>
          </li>
        {/each}
      </ul>
    </section>

    <section id="skills">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>Skills</h2>
      {#each skillCategories as category}
        <h3>
          <span class="mark" aria-hidden="true">{"### "}</span>{category.name}
        </h3>
        <p>{category.items.join(" · ")}</p>
      {/each}
    </section>

    <section id="work">
      <h2><span class="mark" aria-hidden="true">{"## "}</span>Work</h2>

      <h3><span class="mark" aria-hidden="true">{"### "}</span>Live Work</h3>
      <ul>
        {#each liveWork as live}
          <li>
            <strong>{live.name}</strong><br />
            {@render link(live.url, live.domain)}
          </li>
        {/each}
      </ul>

      <h3>
        <span class="mark" aria-hidden="true">{"### "}</span>Personal Projects
      </h3>
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

  nav {
    margin-top: 16px;
    line-height: 2;
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
