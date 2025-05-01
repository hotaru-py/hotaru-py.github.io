<script>
  const browserMethods = [
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/prajesh-raam",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0077B5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`,
    },
    {
      name: "Email",
      url: "mailto:prajeshraam@gmail.com",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#D44638"><path d="M24 4.5v15c0 .85-.65 1.5-1.5 1.5H1.5C.65 21 0 20.35 0 19.5v-15c0-.85.65-1.5 1.5-1.5h21c.85 0 1.5.65 1.5 1.5zm-1.5 0l-10.5 7-10.5-7h21zM22.5 19.5v-12.51l-10.5 7-10.5-7v12.51h21z"/></svg>`,
    },
    {
      name: "GitHub",
      url: "https://github.com/hotaru-py",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#333333"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
    },
    {
      name: "YouTube (random stuff)",
      url: "https://www.youtube.com/@hotaruuuh",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF0000"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`,
    },
    {
      name: "YouTube (animations)",
      url: "https://www.youtube.com/@hotaruuh",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF0000"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>`,
    },
  ];
</script>

<div class="browser-container">
  <h2 class="browser-title">Links</h2>
  <div class="browser-grid">
    {#each browserMethods as method}
      <div class="browser-card">
        <div class="browser-row">
          <div class="browser-icon">
            {@html method.icon}
          </div>
          <h3 class="browser-name">{method.name}</h3>
          <a
            href={method.url}
            target="_blank"
            rel="noopener noreferrer"
            class="browser-link"
          >
            →
          </a>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .browser-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: calc(100% + 16px);
    margin-left: -8px;
    margin-right: -8px;
    margin-top: 0;
    box-sizing: border-box;
    padding: 16px;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .browser-container {
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .browser-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;
  }

  .browser-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
    overflow-y: visible;
    padding-right: 8px;
  }

  .browser-card {
    background-color: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.15);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(163, 216, 233, 0.3);
  }

  .browser-card:hover {
    transform: translateY(-4px);
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
  }

  .browser-row {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .browser-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
  }

  .browser-icon :global(svg) {
    width: 24px;
    height: 24px;
  }

  .browser-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    flex-grow: 1;
  }

  .browser-link {
    font-size: 20px;
    color: #1b4965;
    text-decoration: none;
    padding: 4px 8px;
    margin-left: auto;
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .browser-link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #1b4965;
    transition: width 0.3s ease;
  }

  .browser-link:hover {
    transform: translateX(2px);
  }

  .browser-link:hover::after {
    width: 100%;
  }
</style>
