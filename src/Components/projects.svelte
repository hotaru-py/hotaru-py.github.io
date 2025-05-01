<script>
  const projects = [
    {
      name: "This website",
      description: "My personal portfolio with a desktop-like interface",
      link: "https://github.com/hotaru-hspr/hotaru-hspr.github.io",
      status: "WIP",
    },
    {
      name: "Starboard",
      description: "A private project currently in development",
      link: "https://github.com/hotaru-hspr/Starboard",
      status: "WIP",
      isPrivate: true,
    },
    {
      name: "PhiTector",
      description: "AI model to detect AI-generated content",
      link: "https://github.com/Shivsrijit/PhiTector",
    },
    {
      name: "SkibidiGPT",
      description: "A creative AI project",
      link: "https://skibidigpt.vercel.app/",
    },
    {
      name: "EcoQuests",
      description: "Environmental awareness game/app",
      link: "https://github.com/EditaCTF/Envithon-EcoQuests",
    },
  ];
</script>

<div class="projects-container">
  <h2 class="projects-title">
    My Projects
    <a
      href="https://github.com/hotaru-py"
      target="_blank"
      rel="noopener noreferrer"
      class="github-icon-link"
      aria-label="View GitHub profile"
    >
      <span class="github-icon">🐙</span>
    </a>
  </h2>

  <div class="projects-grid">
    {#each projects as project}
      <div class="project-card">
        <div class="project-header">
          <h3 class="project-name">
            {project.name}
            {#if project.status}
              <span class="project-status">{project.status}</span>
            {/if}
            {#if project.isPrivate}
              <span class="project-private">Private</span>
            {/if}
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
    width: 100%;
  }

  .projects-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .github-icon-link {
    color: #2c3e50;
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
    overflow-y: auto;
  }

  .project-card {
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(163, 216, 233, 0.3);
  }

  .project-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
  }

  .project-header {
    margin-bottom: 12px;
  }

  .project-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .project-status {
    font-size: 12px;
    font-weight: normal;
    background-color: rgba(194, 239, 211, 0.5);
    color: #2c3e50;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
  }

  .project-private {
    font-size: 12px;
    font-weight: normal;
    background-color: rgba(243, 188, 188, 0.5);
    color: #2c3e50;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
  }

  .project-description {
    font-size: 14px;
    color: #4a4a4a;
    margin-bottom: 16px;
    flex-grow: 1;
  }

  .project-link {
    font-size: 14px;
    color: #1b4965;
    text-decoration: none;
    padding: 4px 0;
    align-self: flex-start;
    position: relative;
  }

  .project-link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #1b4965;
    transition: width 0.3s ease;
  }

  .project-link:hover::after {
    width: 100%;
  }
</style>
