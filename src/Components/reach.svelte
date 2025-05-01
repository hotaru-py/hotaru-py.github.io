<script>
  const contactMethods = [
    {
      name: "LinkedIn",
      url: "https://linkedin.com/in/prajesh-raam",
      icon: "👔",
      description:
        "Connect with me on LinkedIn for professional networking and opportunities.",
    },
    {
      name: "Email",
      url: "mailto:prajeshraam@gmail.com",
      icon: "✉️",
      description:
        "Send me an email directly for project inquiries or collaboration requests.",
    },
    {
      name: "GitHub",
      url: "https://github.com/hotaru-py",
      icon: "🐙",
      description:
        "Check out my code repositories and open-source contributions.",
    },
    {
      name: "Twitter",
      url: "https://twitter.com/prajeshraam",
      icon: "🐦",
      description: "Follow me for updates on projects and tech discussions.",
    },
  ];
</script>

<div class="contact-container">
  <h2 class="contact-title">Contact Me</h2>

  <div class="contact-message">
    <p>
      I'm open to <span class="highlight">projects and internships</span>. Feel
      free to reach out through any of the following channels:
    </p>
  </div>

  <div class="contact-grid">
    {#each contactMethods as method}
      <div class="contact-card">
        <div class="contact-header">
          <div class="contact-icon">{method.icon}</div>
          <h3 class="contact-name">{method.name}</h3>
        </div>
        <p class="contact-description">{method.description}</p>
        <a
          href={method.url}
          target="_blank"
          rel="noopener noreferrer"
          class="contact-link"
        >
          Connect →
        </a>
      </div>
    {/each}
  </div>
</div>

<style>
  .contact-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: calc(100% + 16px); /* Compensate for the parent padding */
    margin-left: -8px;
    margin-right: -8px;
    box-sizing: border-box;
    padding: 0 16px 0 16px;
    overflow-y: auto;
  }

  .contact-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;
  }

  .contact-message {
    margin-bottom: 24px;
  }

  .contact-message p {
    font-size: 15px;
    line-height: 1.6;
    color: #4a4a4a;
  }

  .highlight {
    color: #1b4965;
    font-weight: 600;
  }

  .contact-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
    overflow-y: visible;
    padding-right: 8px; /* Add extra padding for scrollbar */
  }

  .contact-card {
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

  .contact-card:hover {
    transform: translateY(-4px);
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
  }

  .contact-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .contact-icon {
    font-size: 24px;
    margin-right: 12px;
  }

  .contact-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .contact-description {
    font-size: 14px;
    color: #4a4a4a;
    margin-bottom: 16px;
    flex-grow: 1;
  }

  .contact-link {
    font-size: 14px;
    color: #1b4965;
    text-decoration: none;
    padding: 4px 0;
    align-self: flex-start;
    position: relative;
  }

  .contact-link::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #1b4965;
    transition: width 0.3s ease;
  }

  .contact-link:hover::after {
    width: 100%;
  }
</style>
