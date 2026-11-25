<script>
  import { getContext } from "svelte";
  import { experience, activities } from "../lib/siteContent.js";
  import { foldable } from "../lib/foldable.js";
  import { entryMedia } from "../lib/siteLinks.js";
  import { fileWindow, FILE_ICONS } from "../lib/workFiles.js";

  const desktop = getContext("desktop");

  const slug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // a picture opens in the picture viewer, unless it points somewhere else (`open`)
  function openPicture(pic, i, seed, title) {
    if (pic.open) return desktop?.openTarget(pic.open);
    const name = pic.caption ?? `${title} (${i + 1})`;
    desktop?.openWindow(
      fileWindow({
        key: `media-${seed}-${i}`,
        kind: "gallery",
        typeLabel: "Photo",
        name,
        fileName: pic.image.startsWith("data:")
          ? `${seed}-${i + 1}.png`
          : pic.image.split("/").pop(),
        description: pic.caption ? title : undefined,
        image: pic.image,
        alt: pic.alt ?? name,
        icon: FILE_ICONS.live,
      }),
    );
  }
</script>

<!-- pictures (visible without expanding) and links into the rest of the site, under a
     job, club or role. see `experience` in siteContent.js -->
{#snippet extras(entry, seed, title)}
  {@const media = entryMedia(entry)}
  {#if media.length}
    <div class="media">
      {#each media as pic, i}
        <button
          type="button"
          class="thumb"
          onclick={() => openPicture(pic, i, seed, title)}
          aria-label={pic.caption ?? `${title}, picture ${i + 1}`}
        >
          <img src={pic.image} alt="" loading="lazy" />
        </button>
      {/each}
    </div>
  {/if}
  {#if entry.links?.length}
    <div class="links">
      {#each entry.links as link}
        <button
          type="button"
          class="link-pill"
          onclick={() => desktop?.openTarget(link.open)}>{link.label} →</button
        >
      {/each}
    </div>
  {/if}
{/snippet}

{#snippet jobSub(job)}
  <span class="sub">
    {#if job.url}<a href={job.url} target="_blank" rel="noopener noreferrer"
        >{job.company}</a
      >{:else}{job.company}{/if}
    ({job.period})
  </span>
{/snippet}

<div class="experience">
  <h2 class="title">Work Experience</h2>
  <ul class="entries">
    {#each experience as job}
      <li>
        {#if job.description}
          <details use:foldable>
            <summary>
              <span class="role">{job.role}</span>
              {@render jobSub(job)}
            </summary>
            <p class="desc">{job.description}</p>
          </details>
        {:else}
          <span class="role">{job.role}</span>
          {@render jobSub(job)}
        {/if}
        {@render extras(job, `job-${slug(job.company)}`, job.company)}
      </li>
    {/each}
  </ul>

  <h2 class="title">Clubs &amp; Activities</h2>
  <ul class="entries">
    {#each activities as club}
      <li>
        <span class="role">
          {#if club.url}<a
              class="org-link"
              href={club.url}
              target="_blank"
              rel="noopener noreferrer">{club.org}</a
            >{:else}{club.org}{/if}
        </span>
        {@render extras(club, `club-${slug(club.org)}`, club.org)}
        <ul class="roles">
          {#each club.roles as entry}
            <li>
              {#if entry.description}
                <details use:foldable>
                  <summary>
                    <span class="role-name">{entry.role}</span>
                    {#if entry.period}<span class="sub">{entry.period}</span>{/if}
                  </summary>
                  <p class="desc">{entry.description}</p>
                </details>
              {:else}
                <span class="role-name">{entry.role}</span>
                {#if entry.period}<span class="sub">{entry.period}</span>{/if}
              {/if}
              {@render extras(
                entry,
                `role-${slug(club.org)}-${slug(entry.role)}`,
                entry.role,
              )}
            </li>
          {/each}
        </ul>
      </li>
    {/each}
  </ul>
</div>

<style>
  .experience {
    color: var(--color-ink);
  }

  .title {
    margin: 0 0 16px;
    padding-bottom: 12px;
    border-bottom: var(--ink-border);
    font-size: 20px;
    font-weight: 700;
  }

  .entries {
    margin: 0 0 28px;
    padding: 0;
    list-style: none;
  }

  .entries li {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .entries li + li {
    margin-top: 16px;
  }

  .role {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  .sub {
    font-size: 14px;
    color: var(--color-ink-muted);
  }

  .sub a {
    color: var(--color-ink);
    font-weight: 700;
  }

  /* a club's roles, indented under its name with a rule down the side */
  .roles {
    margin: 4px 0 0;
    padding: 0 0 0 12px;
    border-left: 2px solid var(--color-moss-300);
    list-style: none;
  }

  .roles li + li {
    margin-top: 8px;
  }

  .org-link {
    color: var(--color-ink);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .desc {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--color-ink-muted);
  }

  summary {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    padding-right: 22px;
    cursor: pointer;
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::after {
    content: "+";
    position: absolute;
    top: 0;
    right: 2px;
    font-weight: 700;
    color: var(--color-ink-muted);
  }

  details[open]:not([data-expanded="false"]) > summary::after {
    content: "−";
  }

  /* a row of small pictures, each opening in the picture viewer */
  .media {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
  }

  .thumb {
    width: 104px;
    aspect-ratio: 4 / 3;
    padding: 0;
    border: var(--ink-border);
    border-radius: 8px;
    background: var(--color-moss-100);
    box-shadow: 2px 2px 0 var(--color-ink);
    overflow: hidden;
    cursor: pointer;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
  }

  .thumb:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 var(--color-ink);
  }

  .thumb:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .thumb img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* links into other apps: outlined pills, filled on hover */
  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }

  .link-pill {
    padding: 3px 10px;
    border: 1.5px solid var(--color-ink);
    border-radius: 999px;
    background: none;
    color: var(--color-ink);
    font: inherit;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .link-pill:hover {
    background: var(--color-ink);
    color: var(--color-paper);
  }

  .role-name {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-ink-soft);
  }
</style>
