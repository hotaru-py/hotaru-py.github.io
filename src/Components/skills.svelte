<script>
  const noteSequence = [
    "A4",
    "E5",
    "A4",
    "G#4",
    "A4",
    "E4",
    "A4",
    "A4",
    "E5",
    "A4",
    "G#4",
    "A4",
    "E4",
    "A4",
    "E5",
    "A4",
    "G#4",
    "A4",
    "E4",
    "D4",
    "C#4",
    "D4",
    "E4",
    "B4",
    "A4",
  ];

  const noteFileMap = {
    A4: "xylo_A4.mp3",
    E5: "xylo_E5.mp3",
    "G#4": "xylo_Gsharp4.mp3",
    E4: "xylo_E4.mp3",
    D4: "xylo_D4.mp3",
    "C#4": "xylo_Csharp4.mp3",
    B4: "xylo_B4.mp3",
  };

  const audioByNote = Object.fromEntries(
    Object.entries(noteFileMap).map(([note, filename]) => {
      const audio = new Audio(`/xylo/${filename}`);
      audio.preload = "auto";
      audio.load();
      return [note, audio];
    }),
  );

  let noteIndex = 0;
  let activeTouchAudio;
  let lastTouchAt = 0;

  function playSound(allowOverlap = true) {
    const note = noteSequence[noteIndex % noteSequence.length];
    noteIndex = (noteIndex + 1) % noteSequence.length;

    if (!allowOverlap && activeTouchAudio) {
      activeTouchAudio.pause();
      activeTouchAudio.currentTime = 0;
    }

    const audio = audioByNote[note].cloneNode();
    audio.volume = 0.8;
    if (!allowOverlap) {
      activeTouchAudio = audio;
    }
    audio.play().catch((error) => {
      console.warn(`Unable to play xylo note ${note}:`, error);
    });
  }

  function playHoverSound() {
    if (Date.now() - lastTouchAt < 500) {
      return;
    }
    playSound();
  }

  function playTouchSound(event) {
    event.preventDefault();
    lastTouchAt = Date.now();
    playSound(false);
  }

  const skillCategories = [
    {
      name: "Full-Stack Development",
      items: [
        "React",
        "Next.js",
        "JavaScript / TypeScript",
        "Shopify Liquid",
        "Svelte",
        "Python",
        "FastAPI",
        "Flask",
        "Node.js",
        "SQL",
      ],
    },
    {
      name: "Design & Creative",
      items: [
        "Figma",
        "Inkscape",
        "Krita",
        "Canva",
        "Premiere Pro",
        "Blender",
        "Pen & Paper",
      ],
    },
  ];
</script>

<div class="skills-container">
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
        (March 2025 - February 2026)
      </span>
    </p>
  </div>

  <h2 class="skills-title">Skills</h2>

  <div class="skills-grid">
    {#each skillCategories as category}
      <div class="skill-card">
        <div class="skill-header">
          <h3 class="skill-category-name">
            {category.name}
          </h3>
          {#if category.blurb}
            <p class="skill-blurb">{category.blurb}</p>
          {/if}
        </div>
        <div class="skill-pills">
          {#each category.items as skill}
            <span
              class="skill-pill"
              tabindex="0"
              on:mouseenter={playHoverSound}
              on:touchstart={playTouchSound}
              on:focus={playHoverSound}
              on:keydown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  playHoverSound();
                }
              }}
            >
              {skill}
            </span>
          {/each}
        </div>
      </div>
    {/each}
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
    font-weight: 700;
    color: var(--color-ink);
    margin: 0 0 16px 0;
    padding-bottom: 12px;
    border-bottom: var(--ink-border);
  }

  .skills-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin-bottom: 24px;
    padding: 0 8px 8px 0;
    isolation: isolate;
  }

  .skill-card {
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
  .skill-card::after {
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

  .skill-card:hover {
    top: -2px;
    left: -2px;
  }

  .skill-card:hover::after {
    transform: translate(8px, 8px);
    background-image: var(--halftone-sparkle, var(--halftone));
    background-size: var(--halftone-sparkle-size, var(--halftone-shadow-size));
  }

  .skill-header {
    margin-bottom: 12px;
  }

  .skill-category-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-ink);
    margin: 0;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .skill-blurb {
    font-size: 13px;
    color: var(--color-ink-muted);
    margin: 4px 0 0 0;
  }

  .skill-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .skill-pill {
    background-color: var(--color-paper);
    border: 1.5px solid var(--color-ink);
    padding: 3px 10px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color-ink);
    white-space: nowrap;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;
  }

  .skill-pill:hover {
    background-color: var(--color-ink);
    color: var(--color-paper);
  }

  .skills-description {
    margin-bottom: 24px;
  }

  .skills-description p {
    margin-bottom: 16px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-ink-soft);
  }

  .skills-description p:last-child {
    margin-bottom: 0;
  }

  .about-paragraph {
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 16px;
    color: var(--color-ink);
    font-weight: 600;
  }

  .about-subtitle {
    display: block;
    font-size: 14px;
    color: var(--color-ink-muted);
    margin-top: 4px;
  }

  .company-link {
    color: var(--color-ink);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: var(--color-accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 3px;
  }
</style>
