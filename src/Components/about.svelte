<script>
</script>

<div class="about-container">
  <div class="about-header">
    <img src="/firefly.webp" alt="Hotaru" class="about-avatar" />
    <h1 class="about-title">Prajesh Raam</h1>
  </div>

  <div class="about-content">
    <p class="about-paragraph">
      👋 Hello, I'm <span class="highlight">Prajesh</span>, an undergrad student
      at Shiv Nadar University Chennai, pursuing my Bachelors in Computer
      Science.
    </p>

    <p class="about-paragraph">
      I'm a developer, currently focused on Full Stack Development and picking
      up Game Development for something I've planned in the long run.
    </p>

    <p class="about-paragraph">
      With my love for art and design, combined with my lifelong interest in
      development, I love to identify problems and create solutions that are
      visually appealing, highly functional and accessible to people.
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
    border-bottom: 1px solid #eaeaea;
    margin-bottom: 20px;
  }

  .about-avatar {
    width: 72px;
    height: 72px;
    border-radius: 8px;
    margin-right: 16px;
    object-fit: cover;
  }

  .about-title {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .about-content {
    overflow-y: auto;
  }

  .about-paragraph {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 16px;
    color: #4a4a4a;
  }

  .highlight {
    color: #1b4965;
    font-weight: 600;
  }
</style>
