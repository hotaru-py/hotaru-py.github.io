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
      name: "Art & Editing (still learning)",
      items: skills.art,
    },
    {
      name: "Other Miscellaneous",
      items: skills.misc,
    },
  ];
</script>

<div class="skills-container">
  <h2 class="skills-title">Professional Skills</h2>

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
    <p>
      I'm a <span class="highlight">Full Stack Developer</span> and a proficient
      <span class="highlight">UI/UX designer</span>, focusing on balancing
      functionality, design, usability and aesthetics from the user's
      perspective.
    </p>

    <p>
      I work primarily with Svelte and have used React and Next.js extensively
      in my projects for the Frontend, which I conceptualize using Figma and
      Inkscape.
    </p>

    <p>
      I've worked with Python and FastAPI for the backend, which I'm still
      exploring as part of my migration from Frontend to Full Stack Development.
    </p>
  </div>
</div>

<style>
  .skills-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow-y: auto;
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
  }

  .skill-card {
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

  .skill-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
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

  .skill-learning-tag {
    font-size: 12px;
    font-weight: normal;
    background-color: rgba(194, 239, 211, 0.5);
    color: #2c3e50;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
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

  .highlight {
    color: #1b4965;
    font-weight: 600;
  }

  .content-header,
  .avatar,
  .title {
    display: none;
  }
</style>
