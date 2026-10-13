<script>
</script>

<div class="about-container">
  <div class="about-header">
    <img src="/firefly.webp" alt="Hotaru" class="about-avatar" />
    <h1 class="about-title">
      Prajesh Raam <span class="highlight_smol">(hotaru)</span>
    </h1>
  </div>

  <div class="about-content">
    <p class="about-paragraph">
      👋 Hello, I'm <span class="highlight">Prajesh</span>, an undergrad
      Computer Science student. I work on a few different things, including but
      not limited to:
    </p>

    <ul class="about-list">
      <li><span class="highlight">software development</span> across stacks</li>
      <li>
        designing <span class="highlight"
          >visually-appealing, usable and accessible</span
        > experiences
      </li>
      <li>
        <span class="highlight">graphic design</span> and the occasional
        <span class="highlight">doodling</span> (wannabe multimedia design)
      </li>
      <li>
        <span class="highlight">product and interaction design</span> in the long
        run
      </li>
    </ul>

    <h3 class="about-heading">Education</h3>
    <p class="about-paragraph">
      Shiv Nadar University Chennai
      <span class="about-subtitle"
        >B.Tech Artificial Intelligence and Data Science (2023-2027)</span
      >
    </p>
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
    object-fit: cover;
    background-color: var(--color-accent);
    border: var(--ink-border);
    box-shadow: 3px 3px 0 var(--color-ink);
    padding: 4px;
  }

  .about-title {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0;
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
  }
</style>
