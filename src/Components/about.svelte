<script module>
  import { preloadImages } from "../lib/preload.js";
  // Padded so the whole drawing fits inside a circle (the start menu uses it too)
  import avatar from "../assets/firefly-avatar.webp";

  preloadImages([avatar]);
</script>

<script>
  import { about, emphasis, schoolName } from "../lib/siteContent.js";
</script>

<div class="about-container">
  <div class="about-header">
    <img src={avatar} alt="Hotaru" class="about-avatar" />
    <h1 class="about-title">
      {about.greeting} <span class="pronouns">({about.pronouns})</span>
    </h1>
  </div>

  <div class="about-content">
    {#each about.intro as paragraph}
      <p class="about-paragraph">{paragraph}</p>
    {/each}

    <ul class="about-list">
      {#each about.interests as item}
        <li>
          {#each emphasis(item) as part}{#if part.strong}<span class="highlight"
                >{part.text}</span
              >{:else}{part.text}{/if}{/each}
        </li>
      {/each}
    </ul>

    <p class="about-paragraph">{about.outro}</p>

    <h3 class="about-heading">Education</h3>
    {#each about.education as entry}
      <p class="about-paragraph">
        {schoolName(entry)}
        {#each entry.lines as line}
          <span class="about-subtitle">{line}</span>
        {/each}
      </p>
    {/each}
  </div>
</div>

<style>
  .about-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .about-header {
    display: flex;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: var(--ink-border);
    margin-bottom: 20px;
  }

  .about-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    margin-right: 16px;
    object-fit: contain;
    background-color: var(--color-accent);
    border: var(--ink-border);
    box-shadow: 3px 3px 0 var(--color-ink);
    padding: 2px;
  }

  .about-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0;
  }

  .pronouns {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-ink-muted);
    white-space: nowrap;
  }

  .about-content {
    overflow-y: auto;
  }

  .about-paragraph {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 16px;
    color: var(--color-ink-soft);
  }

  .about-subtitle {
    display: block;
    font-size: 14px;
    color: var(--color-ink-muted);
    margin-top: 4px;
  }

  .highlight {
    color: var(--color-ink);
    font-weight: 700;
  }

  .highlight_smol {
    font-size: 16px;
    color: var(--color-ink-muted);
    font-weight: 600;
  }

  .about-list {
    margin-bottom: 20px;
    padding-left: 20px;
    color: var(--color-ink-soft);
    line-height: 1.6;
    list-style-type: disc;
  }

  .about-list li {
    margin-bottom: 8px;
  }

  .about-heading {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 24px 0 12px 0;
    padding-bottom: 12px;
    border-bottom: var(--ink-border);
  }
</style>
