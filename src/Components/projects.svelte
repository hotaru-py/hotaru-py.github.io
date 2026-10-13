<script>
  const projects = [
    {
      name: "My Personal Website (this one!)",
      description: "My personal website, with a desktop/mobile-like interface",
      link: "https://github.com/hotaru-hspr/hotaru-hspr.github.io",
    },
    {
      name: "Eunoia",
      description:
        "AI-powered DIY learning platform that turns objects at hand into hands-on projects using computer vision & RAG",
      link: "https://github.com/Try3D/Eunoia",
    },
    {
      name: "Minimalist ROG Grub Theme",
      description: "Minimalist theme for the Grub Bootloader",
      link: "https://github.com/hotaru-py/rog-grub",
    },
    {
      name: "Starboard",
      description:
        "A fast, versatile, extensible and highly flexible platform for optimal ship routing",
      link: "https://github.com/hotaru-hspr/Starboard",
    },
    {
      name: "SNUGPA",
      description: "CGPA/SGPA Calculator for SNU Chennai",
      link: "https://github.com/EditaCTF/SNUC_Grade_Calculator",
    },
    {
      name: "CacheSim",
      description: "Animated Cache Simulation using Svelte & FastAPI",
      link: "https://github.com/hotaru-py/CacheSim",
    },
  ];
</script>

<div class="projects-container">
  <h2 class="projects-title">
    My Personal Projects
    <a
      href="https://github.com/hotaru-py"
      target="_blank"
      rel="noopener noreferrer"
      class="github-icon-link"
      aria-label="View GitHub profile"
    >
      <span class="github-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          ><path
            d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
          /></svg
        >
      </span>
    </a>
  </h2>

  <div class="projects-grid">
    {#each projects as project}
      <div class="project-card">
        <div class="project-header">
          <h3 class="project-name">
            {project.name}
          </h3>
        </div>
        <p class="project-description">{project.description}</p>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          class="project-link"
        >
          View Project →
        </a>
      </div>
    {/each}
  </div>
</div>

<style>
  .projects-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: calc(100% + 16px);
    margin-left: -8px;
    margin-right: -8px;
    box-sizing: border-box;
    padding: 0 16px 0 16px;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .projects-container {
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .projects-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: var(--ink-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .github-icon-link {
    color: var(--color-ink);
    text-decoration: none;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .github-icon-link:hover {
    transform: translateY(-2px);
  }

  .github-icon {
    font-size: 20px;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
    padding: 0 8px 8px 0;
    isolation: isolate;
  }

  .project-card {
    position: relative;
    background-color: var(--color-paper);
    border-radius: 12px;
    padding: 16px;
    border: var(--ink-border);
    top: 0;
    left: 0;
    /* Offsets, not transform: a transform would lift the halftone shadow above the card */
    transition:
      top 0.15s ease,
      left 0.15s ease;
    display: flex;
    flex-direction: column;
  }

  /* Halftone drop shadow; the grid isolates it so it stays behind the card */
  .project-card::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background-image: var(--halftone);
    background-size: var(--halftone-shadow-size);
    transform: translate(6px, 6px);
    transition: transform 0.15s ease;
    z-index: -1;
  }

  .project-card:hover {
    top: -2px;
    left: -2px;
  }

  .project-card:hover::after {
    transform: translate(8px, 8px);
    background-image: var(--halftone-sparkle, var(--halftone));
    background-size: var(--halftone-sparkle-size, var(--halftone-shadow-size));
  }

  .project-header {
    margin-bottom: 12px;
  }

  .project-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .project-description {
    font-size: 14px;
    color: var(--color-ink-soft);
    margin-bottom: 16px;
    flex-grow: 1;
  }

  .project-link {
    font-size: 14px;
    font-weight: 700;
    color: var(--color-ink);
    text-decoration: none;
    padding: 4px 0;
    align-self: flex-start;
  }
</style>
