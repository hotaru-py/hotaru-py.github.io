<script>
  import { experience, activities } from "../lib/siteContent.js";
  import { foldable } from "../lib/foldable.js";
</script>

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

  /* A club's roles, indented under its name with a rule down the side */
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

  .role-name {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-ink-soft);
  }
</style>
