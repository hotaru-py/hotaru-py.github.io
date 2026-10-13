<script>
  import { onMount } from "svelte";

  // The field is computed at 1/SCALE resolution and upscaled by the browser
  const SCALE = 7;

  // Spring pulling particles back into the blob; low damping gives a jelly wobble
  const SPRING = 2.4;
  const DAMPING = 1.4;
  // The blob's center is a body too: it follows a slow drift path but can be shoved
  const ANCHOR_SPRING = 0.5;
  const ANCHOR_DAMPING = 1.1;
  const ANCHOR_DRAG = 1.2;

  // Cursor push: a little when hovering, much more when swiping fast
  const PUSH_BASE = 300;
  const PUSH_PER_SPEED = 9;
  // Cursor drag: nearby goo gets swept along with the cursor's motion
  const DRAG = 7;
  const MAX_POINTER_SPEED = 4000;
  const POINTER_REACH = 0.3; // of the blob unit

  // On narrow screens the blob is sized from the screen's area instead of its short
  // side, which would make it small on a tall phone. Same shape and motion, just scaled up.
  const MOBILE_MAX_WIDTH = 768;
  const MOBILE_UNIT = 1.05; // of sqrt(width * height)

  // Blob layout in blob units: many small particles, so a swipe can cut a clean gap
  const ring = (count, dist, r, phase = 0) =>
    Array.from({ length: count }, (_, i) => ({
      angle: phase + (i / count) * Math.PI * 2,
      dist,
      r: r * (1 + 0.15 * Math.sin(i * 2.3)),
      // Slightly different orbit speeds keep the outline shifting
      spin: 0.05 + 0.03 * Math.sin(i * 1.7 + dist * 10),
    }));
  const PARTICLES = [
    { angle: 0, dist: 0, r: 0.16, spin: 0 },
    ...ring(7, 0.14, 0.13),
    ...ring(12, 0.28, 0.12, 0.3),
    ...ring(16, 0.42, 0.1, 0.6),
  ];

  // Gaussian falloff lookup; contributions beyond GAUSS_CUTOFF (in r^2 units) are dropped
  const GAUSS_CUTOFF = 9;
  const GAUSS_STEPS = 1024;
  const GAUSS = Float32Array.from({ length: GAUSS_STEPS }, (_, i) =>
    Math.exp(-(i / GAUSS_STEPS) * GAUSS_CUTOFF),
  );

  // Normalized field intensity -> moss shade; the resting peak lands near moss-400
  const PEAK = 0.87;
  const STOPS = [
    [0.0, "--color-moss-50"],
    [0.15, "--color-moss-100"],
    [0.35, "--color-moss-200"],
    [0.6, "--color-moss-300"],
    [0.85, "--color-moss-400"],
    [1.0, "--color-moss-500"],
  ];

  let canvas;

  onMount(() => {
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const lut = buildColorLut();
    let width = 0;
    let height = 0;
    let unit = 0; // blob size basis: the short side on desktop
    let frames = 0;
    let image = null;
    let field = null;
    let fieldScale = 1;

    const particles = PARTICLES.map((p) => ({
      ...p,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
    }));
    const anchor = { x: 0, y: 0, vx: 0, vy: 0 };

    const pointer = { x: 0, y: 0, vx: 0, vy: 0, active: false, lastTime: 0 };

    // The slow path the blob's center drifts along
    function drift(t) {
      return [
        width * (0.52 + 0.24 * Math.sin(t * 0.06)),
        height * (0.5 + 0.2 * Math.sin(t * 0.08 + 1)),
      ];
    }

    // Where each particle wants to be, relative to the blob's center
    function target(p, i, t) {
      const angle = p.angle + t * p.spin;
      const dist = p.dist * unit * (1 + 0.15 * Math.sin(t * 0.6 + i));
      return [
        anchor.x + Math.cos(angle) * dist,
        anchor.y + Math.sin(angle) * dist,
      ];
    }

    function settle(t) {
      [anchor.x, anchor.y] = drift(t);
      anchor.vx = anchor.vy = 0;
      particles.forEach((p, i) => {
        [p.x, p.y] = target(p, i, t);
        p.vx = p.vy = 0;
      });
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const mobile = width <= MOBILE_MAX_WIDTH;
      unit = mobile
        ? Math.sqrt(width * height) * MOBILE_UNIT
        : Math.min(width, height);
      frames = 0; // resample the clock backdrop on the next draw
      canvas.width = Math.ceil(width / SCALE);
      canvas.height = Math.ceil(height / SCALE);
      image = ctx.createImageData(canvas.width, canvas.height);
      field = new Float32Array(canvas.width * canvas.height);
      calibrate();
    }

    // Measure the resting blob's peak once per size, so colors stay put during splits
    function calibrate() {
      const saved = particles.map((p) => [p.x, p.y]);
      const savedAnchor = [anchor.x, anchor.y];
      [anchor.x, anchor.y] = [width / 2, height / 2];
      particles.forEach((p, i) => ([p.x, p.y] = target(p, i, 0)));
      accumulate();
      let peak = 0;
      for (const v of field) peak = Math.max(peak, v);
      fieldScale = (PEAK * 255) / peak;
      particles.forEach((p, i) => ([p.x, p.y] = saved[i]));
      [anchor.x, anchor.y] = savedAnchor;
    }

    function step(t, dt) {
      const reach = unit * POINTER_REACH;
      const speed = Math.hypot(pointer.vx, pointer.vy);
      const clamp = speed > MAX_POINTER_SPEED ? MAX_POINTER_SPEED / speed : 1;
      const pvx = pointer.vx * clamp;
      const pvy = pointer.vy * clamp;

      // Move the blob's center: spring to its drift path, shoved by nearby swipes
      const [driftX, driftY] = drift(t);
      let aax =
        ANCHOR_SPRING * (driftX - anchor.x) - ANCHOR_DAMPING * anchor.vx;
      let aay =
        ANCHOR_SPRING * (driftY - anchor.y) - ANCHOR_DAMPING * anchor.vy;
      if (pointer.active) {
        const d = Math.hypot(pointer.x - anchor.x, pointer.y - anchor.y);
        const blobReach = unit * 0.5;
        if (d < blobReach) {
          const falloff = 1 - d / blobReach;
          aax += pvx * ANCHOR_DRAG * falloff;
          aay += pvy * ANCHOR_DRAG * falloff;
        }
      }
      anchor.vx += aax * dt;
      anchor.vy += aay * dt;
      anchor.x += anchor.vx * dt;
      anchor.y += anchor.vy * dt;

      particles.forEach((p, i) => {
        const [tx, ty] = target(p, i, t);
        let ax = SPRING * (tx - p.x) - DAMPING * p.vx;
        let ay = SPRING * (ty - p.y) - DAMPING * p.vy;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < reach) {
            const falloff = (1 - d / reach) ** 2;
            const push = falloff * (PUSH_BASE + PUSH_PER_SPEED * speed * clamp);
            ax += (dx / d) * push + (pvx - p.vx) * DRAG * falloff;
            ay += (dy / d) * push + (pvy - p.vy) * DRAG * falloff;
          }
        }

        p.vx += ax * dt;
        p.vy += ay * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      });

      // Pointer velocity fades out once the cursor stops moving
      const decay = Math.exp(-dt * 8);
      pointer.vx *= decay;
      pointer.vy *= decay;
    }

    // Splat each particle's gaussian into the field, only over the cells it reaches
    function accumulate() {
      const w = canvas.width;
      const h = canvas.height;
      field.fill(0);
      for (const p of particles) {
        const r = p.r * unit;
        const toIndex = GAUSS_STEPS / GAUSS_CUTOFF / (r * r);
        const extent = r * Math.sqrt(GAUSS_CUTOFF);
        const x0 = Math.max(0, Math.floor((p.x - extent) / SCALE));
        const x1 = Math.min(w - 1, Math.ceil((p.x + extent) / SCALE));
        const y0 = Math.max(0, Math.floor((p.y - extent) / SCALE));
        const y1 = Math.min(h - 1, Math.ceil((p.y + extent) / SCALE));
        for (let y = y0; y <= y1; y++) {
          const dy = (y + 0.5) * SCALE - p.y;
          const dy2 = dy * dy;
          let o = y * w + x0;
          for (let x = x0; x <= x1; x++, o++) {
            const dx = (x + 0.5) * SCALE - p.x;
            const k = ((dx * dx + dy2) * toIndex) | 0;
            if (k < GAUSS_STEPS) field[o] += GAUSS[k];
          }
        }
      }
    }

    // Tell the mobile home screen clock what the wallpaper looks like behind it
    // so its ink can adapt (deeper green over the blob, paper if it ever gets dark)
    const inkRgb = cssRgb("--color-ink");
    const deepRgb = cssRgb("--color-moss-900");
    const paperRgb = cssRgb("--color-paper");
    let lastClockInk = "";

    function sampleClockBackdrop() {
      // Sample wherever the clock actually is (it marks itself with data-wallpaper-sample)
      const target = document.querySelector("[data-wallpaper-sample]");
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const w = canvas.width;
      const h = canvas.height;
      const x0 = Math.max(0, Math.floor(rect.left / SCALE));
      const x1 = Math.min(w, Math.ceil(rect.right / SCALE));
      const y0 = Math.max(0, Math.floor(rect.top / SCALE));
      const y1 = Math.min(h, Math.ceil(rect.bottom / SCALE));
      if (x1 <= x0 || y1 <= y0) return;
      let sum = 0;
      let n = 0;
      for (let y = y0; y < y1; y += 2) {
        for (let x = x0; x < x1; x += 2) {
          sum += field[y * w + x];
          n++;
        }
      }
      const idx = Math.min(255, ((sum / n) * fieldScale) | 0);
      const bg = [lut[idx * 3], lut[idx * 3 + 1], lut[idx * 3 + 2]];

      const dark = luminance(bg) < 0.18;
      const k = idx / 255;
      const rgb = dark
        ? paperRgb
        : inkRgb.map((c, i) => c + (deepRgb[i] - c) * k);
      const ink = `rgb(${rgb.map(Math.round).join(" ")})`;
      if (ink === lastClockInk) return;
      lastClockInk = ink;
      canvas
        .closest(".desktop-container")
        ?.style.setProperty("--clock-ink", ink);
    }

    function draw() {
      accumulate();
      if (frames++ % 8 === 0) sampleClockBackdrop();
      const { data } = image;
      for (let i = 0, o = 0; i < field.length; i++, o += 4) {
        const c = Math.min(255, (field[i] * fieldScale) | 0) * 3;
        data[o] = lut[c];
        data[o + 1] = lut[c + 1];
        data[o + 2] = lut[c + 2];
        data[o + 3] = 255;
      }
      ctx.putImageData(image, 0, 0);
    }

    function handlePointerMove(e) {
      const now = performance.now();
      const dt = (now - pointer.lastTime) / 1000;
      if (pointer.active && dt > 0 && dt < 0.1) {
        pointer.vx = pointer.vx * 0.6 + ((e.clientX - pointer.x) / dt) * 0.4;
        pointer.vy = pointer.vy * 0.6 + ((e.clientY - pointer.y) / dt) * 0.4;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.lastTime = now;
      pointer.active = true;
    }

    function handlePointerLeave() {
      pointer.active = false;
    }

    function handlePointerUp(e) {
      // A lifted finger shouldn't keep pushing the blob
      if (e.pointerType === "touch") handlePointerLeave();
    }

    resize();
    settle(0);
    draw();

    if (reducedMotion) {
      const handleResize = () => {
        resize();
        settle(0);
        draw();
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }

    let frame;
    let last = performance.now();
    const start = last;

    function loop(now) {
      // Clamp so a backgrounded tab doesn't make the blob explode on return
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      step((now - start) / 1000, dt);
      draw();
      frame = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
    };
  });

  // 256-step RGB lookup table built from the moss tokens in app.css
  function buildColorLut() {
    const styles = getComputedStyle(document.documentElement);
    const stops = STOPS.map(([at, token]) => [
      at,
      hexToRgb(styles.getPropertyValue(token).trim()),
    ]);
    const lut = new Uint8ClampedArray(256 * 3);
    for (let i = 0; i < 256; i++) {
      const t = i / 255;
      let j = 0;
      while (j < stops.length - 2 && t > stops[j + 1][0]) j++;
      const [t0, c0] = stops[j];
      const [t1, c1] = stops[j + 1];
      const k = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
      for (let ch = 0; ch < 3; ch++) {
        lut[i * 3 + ch] = c0[ch] + (c1[ch] - c0[ch]) * k;
      }
    }
    return lut;
  }

  function cssRgb(token) {
    return hexToRgb(
      getComputedStyle(document.documentElement).getPropertyValue(token).trim(),
    );
  }

  // WCAG relative luminance of an sRGB color (0..255 channels)
  function luminance([r, g, b]) {
    const lin = (c) => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
</script>

<div class="wallpaper" aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
  <div class="grain"></div>
</div>

<style>
  .wallpaper {
    position: absolute;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background-color: var(--color-moss-50);
  }

  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .grain {
    position: absolute;
    inset: 0;
    opacity: 0.3;
    mix-blend-mode: overlay;
    /* Colored fractal noise with its contrast stretched so the speckle reads on light tones */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='3 0 0 0 -1 0 3 0 0 -1 0 0 3 0 -1 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
</style>
