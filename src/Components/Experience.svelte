<script>
  import { experience, activities } from "../lib/siteContent.js";
</script>

<div class="experience">
  <h2 class="title">Work Experience</h2>
  <ul class="entries">
    {#each experience as job}
      <li>
        <span class="role">{job.role}</span>
        <span class="sub">
          {#if job.url}<a href={job.url} target="_blank" rel="noopener noreferrer"
              >{job.company}</a
            >{:else}{job.company}{/if}
          ({job.period})
        </span>
      </li>
    {/each}
  </ul>

  <h2 class="title">Clubs &amp; Activities</h2>
  <ul class="entries">
    {#each activities as club}
      <li>
        <span class="role">{club.org}</span>
        <ul class="roles">
          {#each club.roles as entry}
            <li>
              <span class="role-name">{entry.role}</span>
              <span class="sub">{entry.period}</span>
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

  .role-name {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-ink-soft);
  }
</style>
