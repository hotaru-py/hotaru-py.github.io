<script module>
  import { GLYPH_LEVELS, GLYPHS } from "../lib/profileGlyph.js";

  // a halftone in ink on the paper: the background is a faint grid of small dots that
  // makes the circle; the person is inked over it, darker and larger where the photo is
  // darker. on show the dots pop in from the middle outward, then the ink comes up in a
  // sweep from the top left
  const BACKGROUND = { r: 0.26, ink: 0.16 };
  const inkOf = (level) => +(0.35 + 0.65 * (level / GLYPH_LEVELS)).toFixed(3);
  const radiusOf = (level) => +(0.3 + 0.16 * (level / GLYPH_LEVELS)).toFixed(3);
  const POP_MS = 420; // spread of the pop-in, centre to rim
  const INK_FROM_MS = 260;
  const INK_MS = 520; // spread of the inking sweep

  function build(rows) {
    const n = rows.length;
    const c = (n - 1) / 2;
    const dots = [];
    rows.forEach((row, y) =>
      [...row].forEach((cell, x) => {
        if (cell === ".") return;
        const level = +cell;
        dots.push({
          x: x + 0.5,
          y: y + 0.5,
          person: level > 0,
          r: level ? radiusOf(level) : BACKGROUND.r,
          ink: level ? inkOf(level) : BACKGROUND.ink,
          pop: Math.round((Math.hypot(x - c, y - c) / (n / 2)) * POP_MS),
          inkIn: Math.round(INK_FROM_MS + ((x + y) / (2 * (n - 1))) * INK_MS),
        });
      }),
    );
    return { n, dots };
  }

  const BUILT = Object.fromEntries(
    Object.entries(GLYPHS).map(([size, rows]) => [size, build(rows)]),
  );
  const LARGEST = Math.max(...Object.keys(GLYPHS).map(Number));
</script>

<script>
  // the side-profile dot matrix, in the site's ink on its paper. `grid`: 33 for larger
  // avatars (the default), 17 for small icons
  let { label = "hotaru", grid = LARGEST } = $props();
  const glyph = $derived(BUILT[grid] ?? BUILT[LARGEST]);
</script>

<svg
  class="profile-glyph"
  viewBox="0 0 {glyph.n} {glyph.n}"
  role={label ? "img" : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : "true"}
>
  {#each glyph.dots as dot}
    <circle
      cx={dot.x}
      cy={dot.y}
      r={dot.r}
      class:person={dot.person}
      fill-opacity={dot.ink}
      style:--pop="{dot.pop}ms"
      style:--ink-in="{dot.inkIn}ms"
    />
  {/each}
</svg>

<style>
  .profile-glyph {
    display: block;
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  circle {
    fill: var(--color-ink);
    transform-box: fill-box;
    transform-origin: center;
  }

  @media (prefers-reduced-motion: no-preference) {
    circle {
      animation: pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--pop) backwards;
    }

    circle.person {
      animation:
        pop 280ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--pop) backwards,
        ink-in 360ms ease-out var(--ink-in) backwards;
    }
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: scale(0);
    }
  }

  /* the person's dots start as faint background dots, then ink up */
  @keyframes ink-in {
    from {
      fill-opacity: 0.16;
    }
  }
</style>
