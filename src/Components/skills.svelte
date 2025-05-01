<script>
  const skills = {
    frontend: [
      "Svelte",
      "React",
      "React Native",
      "Next.js",
      "Tailwind CSS",
      "JavaScript",
      "TypeScript",
      "Liquid (Shopify)",
    ],
    backend: [
      "Python",
      "FastAPI",
      "Flask",
      "Node.js",
      "C#",
      "C/C++",
      "PostgreSQL",
      "MySQL",
      "GraphQL",
    ],
    design: ["Figma", "Inkscape", "Canva"],
    art: [
      "Krita",
      "Inkscape",
      "Pen & Paper",
      "Storyboarder",
      "Premiere Pro",
      "After Effects",
    ],
    misc: ["Unity Engine", "Blender", "Game Development"],
  };

  const skillCategories = [
    {
      name: "Frontend Development",
      items: skills.frontend,
    },
    {
      name: "Backend Development",
      items: skills.backend,
    },
    {
      name: "Design Tools",
      items: skills.design,
    },
    {
      name: "Art & Video Editing (amateur)",
      items: skills.art,
    },
    {
      name: "Other Miscellaneous",
      items: skills.misc,
    },
  ];
</script>

<div class="skills-container">
  <h2 class="skills-title">Skills</h2>

  <div class="skills-grid">
    {#each skillCategories as category}
      <div class="skill-card">
        <div class="skill-header">
          <h3 class="skill-category-name">
            {category.name}
          </h3>
        </div>
        <div class="skill-pills">
          {#each category.items as skill}
            <span class="skill-pill">{skill}</span>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <div class="skills-description">
    <h2 class="skills-title">Work Experience</h2>
    <p class="about-paragraph">
      Software Development Engineering Intern
      <span class="about-subtitle">
        <a
          href="https://miniture.in"
          target="_blank"
          rel="noopener noreferrer"
          class="company-link">Miniture</a
        >
        (March 2025 - Now)
      </span>
    </p>
  </div>
</div>

<style>
  .skills-container {
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
    .skills-container {
      width: 100%;
      margin-left: 0;
      margin-right: 0;
    }
  }

  .skills-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
    padding-right: 8px;
  }

  .skill-card {
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

  .skill-card:hover {
    transform: translateY(-4px);
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
  }

  .skill-header {
    margin-bottom: 12px;
  }

  .skill-category-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .skill-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-pill {
    background-color: rgba(163, 216, 233, 0.3);
    padding: 4px 10px;
    border-radius: 16px;
    font-size: 13px;
    color: #2c3e50;
    white-space: nowrap;
    transition: transform 0.2s ease;
  }

  .skill-pill:hover {
    transform: translateY(-2px);
    background-color: rgba(139, 198, 244, 0.3);
  }

  .skills-description {
    margin-top: 8px;
  }

  .skills-description p {
    margin-bottom: 16px;
    font-size: 15px;
    line-height: 1.6;
    color: #4a4a4a;
  }

  .skills-description p:last-child {
    margin-bottom: 0;
  }

  .about-paragraph {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 16px;
    color: #4a4a4a;
  }

  .about-subtitle {
    display: block;
    font-size: 14px;
    color: #777;
    margin-top: 4px;
  }

  .company-link {
    color: #1b4965;
    text-decoration: none;
    transition: color 0.2s ease;
    position: relative;
  }

  .company-link:hover {
    color: #3d89c9;
  }

  .company-link::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background-color: #3d89c9;
    transition: width 0.3s ease;
  }

  .company-link:hover::after {
    width: 100%;
  }
</style>
