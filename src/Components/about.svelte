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
      👋 Hello, I'm <span class="highlight">hotaru</span>, an undergrad Computer
      Science student. I do a few random things like:
    </p>

    <ul class="about-list">
      <li>
        do <span class="highlight">software development of all kinds</span>
      </li>
      <li>
        design <span class="highlight">visually-appealing and usable</span> experiences
      </li>
      <li>design <span class="highlight">good-looking</span> graphics</li>
      <li><span class="highlight">doodle</span> (and soon, animate stuff!)</li>
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
    border-bottom: 1px solid #eaeaea;
    margin-bottom: 20px;
  }

  .about-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    margin-right: 16px;
    object-fit: cover;
    background-color: rgba(194, 239, 211, 0.7);
    padding: 4px;
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

  .about-subtitle {
    display: block;
    font-size: 14px;
    color: #777;
    margin-top: 4px;
  }

  .highlight {
    color: #1b4965;
    font-weight: 600;
  }

  .highlight_smol {
    font-size: 16px;
    color: #445a67;
    font-weight: 600;
  }

  .about-list {
    margin-bottom: 20px;
    padding-left: 20px;
    color: #4a4a4a;
    line-height: 1.6;
    list-style-type: disc;
  }

  .about-list li {
    margin-bottom: 8px;
  }

  .about-heading {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 24px 0 12px 0;
  }
</style>
