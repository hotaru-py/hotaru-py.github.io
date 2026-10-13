<script>
  import { fade, fly } from "svelte/transition";
  import DesktopIcon from "./DesktopIcon.svelte";

  /**
   * @typedef {{ col: number, row: number }} Cell
   * @typedef {Object} Props
   * @property {any[]} icons
   * @property {(icon: any) => void} onOpen
   * @property {boolean} [customized] Out: whether any icon is away from its default spot
   */

  /** @type {Props} */
  let { icons, onOpen, customized = $bindable(false) } = $props();

  // Grid pitch matches the icon footprint (100px wide tile + label) plus spacing
  // Icon footprint (tile + label), the smallest gap between icons, and the edge margin
  const ICON_W = 88;
  const ICON_H = 102;
  const MIN_GAP = 12;
  // Gaps stretch to use the space, but never past this; any rest stays at the far edges
  const MAX_GAP = 20;
  const MARGIN = 24;
  // Pointer travel before a press turns into a drag, so plain clicks still open
  const DRAG_THRESHOLD = 5;
  const STORAGE_KEY = "desktop-icon-cells";

  let width = $state(0);
  let height = $state(0);
  // As many cells as fit (the last one needs no trailing gap)...
  const cols = $derived(fit(width, ICON_W));
  const rows = $derived(fit(height, ICON_H));
  // ...then spread evenly so the grid reaches every edge with the same margin
  const pitchX = $derived(pitch(width, ICON_W, cols));
  const pitchY = $derived(pitch(height, ICON_H, rows));

  function fit(size, icon) {
    return Math.max(
      1,
      Math.floor((size - 2 * MARGIN + MIN_GAP) / (icon + MIN_GAP)),
    );
  }

  function pitch(size, icon, count) {
    if (count < 2) return icon + MIN_GAP;
    return Math.min((size - 2 * MARGIN - icon) / (count - 1), icon + MAX_GAP);
  }

  // Where the visitor put each icon; the grid resolves these against its current size
  /** @type {Record<string, Cell>} */
  let preferred = $state(loadPreferred());

  /** @type {Record<string, Cell>} */
  const placed = $derived(resolve(preferred, cols, rows));

  // Compares where icons actually are with a fresh layout, so dragging one back to its
  // original cell counts as unchanged too
  $effect(() => {
    const defaults = resolve({}, cols, rows);
    customized = icons.some(
      (icon) => key(placed[icon.id]) !== key(defaults[icon.id]),
    );
  });

  /** @type {null | { id: string, pointerId: number, startX: number, startY: number, dx: number, dy: number, active: boolean }} */
  let drag = $state(null);
  // Offset an icon animates back from after it is dropped
  /** @type {Record<string, { x: number, y: number }>} */
  let settle = $state({});
  let settling = $state(false);
  let suppressClick = false;

  const dropCell = $derived.by(() => {
    if (!drag?.active) return null;
    const from = placed[drag.id];
    const col = Math.round(from.col + drag.dx / pitchX);
    const row = Math.round(from.row + drag.dy / pitchY);
    return nearestFree({ col, row }, occupiedExcept(drag.id), cols, rows);
  });

  const cellX = (cell) => MARGIN + cell.col * pitchX;
  const cellY = (cell) => MARGIN + cell.row * pitchY;

  function loadPreferred() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      const valid = {};
      for (const [id, cell] of Object.entries(saved ?? {})) {
        if (Number.isInteger(cell?.col) && Number.isInteger(cell?.row)) {
          valid[id] = { col: cell.col, row: cell.row };
        }
      }
      return valid;
    } catch {
      return {};
    }
  }

  function savePreferred() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferred));
    } catch {
      // Storage can be unavailable (private mode, blocked); positions just won't persist
    }
  }

  // Give every icon a unique in-bounds cell, honouring preferences where possible.
  // Icons without a preference fill columns top to bottom, like a fresh desktop,
  // except ones that ask for `corner: "bottom-right"`, which start in the last cell.
  function resolve(prefs, cols, rows) {
    const taken = new Set();
    /** @type {Record<string, Cell>} */
    const out = {};
    let flow = 0;
    icons.forEach((icon) => {
      let fallback;
      if (icon.corner === "bottom-right") {
        fallback = { col: cols - 1, row: rows - 1 };
      } else {
        fallback = { col: Math.floor(flow / rows), row: flow % rows };
        flow++;
      }
      const wanted = prefs[icon.id] ?? fallback;
      const cell = nearestFree(wanted, taken, cols, rows);
      taken.add(key(cell));
      out[icon.id] = cell;
    });
    return out;
  }

  function occupiedExcept(id) {
    return new Set(
      Object.entries(placed)
        .filter(([other]) => other !== id)
        .map(([, cell]) => key(cell)),
    );
  }

  const key = (cell) => `${cell.col},${cell.row}`;

  // Closest free cell to `wanted` (clamped into the grid); spills past the last row if full
  function nearestFree(wanted, taken, cols, rows) {
    const target = {
      col: Math.min(Math.max(wanted.col, 0), cols - 1),
      row: Math.min(Math.max(wanted.row, 0), rows - 1),
    };
    if (!taken.has(key(target))) return target;

    let best = null;
    let bestDist = Infinity;
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        if (taken.has(key({ col, row }))) continue;
        const dist = (col - target.col) ** 2 + (row - target.row) ** 2;
        if (dist < bestDist) {
          best = { col, row };
          bestDist = dist;
        }
      }
    }
    if (best) return best;

    let row = rows;
    while (taken.has(key({ col: 0, row }))) row++;
    return { col: 0, row };
  }

  // Tracked on the window rather than with pointer capture: capture would retarget the
  // follow-up click to the wrapper, and plain clicks need to reach the icon to open it
  function handlePointerDown(e, icon) {
    if (e.button !== 0 || drag) return;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    drag = {
      id: icon.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      dx: 0,
      dy: 0,
      active: false,
    };
  }

  function handlePointerMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    drag.dx = e.clientX - drag.startX;
    drag.dy = e.clientY - drag.startY;
    if (!drag.active && Math.hypot(drag.dx, drag.dy) > DRAG_THRESHOLD) {
      drag.active = true;
      settling = false; // follow the pointer directly, no easing lag
    }
  }

  function stopTracking() {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
  }

  // Don't leave listeners behind if the grid unmounts mid-drag
  $effect(() => stopTracking);

  function handlePointerUp(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    stopTracking();
    const { id, dx, dy, active } = drag;

    if (active && dropCell) {
      // Snap into the new cell, animating from where it was let go
      const from = placed[id];
      easeFrom({
        [id]: {
          x: cellX(from) + dx - cellX(dropCell),
          y: cellY(from) + dy - cellY(dropCell),
        },
      });
      preferred = { ...preferred, [id]: dropCell };
      savePreferred();

      // The click that follows this pointerup shouldn't open the window
      suppressClick = true;
      setTimeout(() => (suppressClick = false));
    }
    drag = null;
  }

  // Start icons at these offsets from their cells, then ease them into place
  function easeFrom(offsets) {
    settle = offsets;
    settling = false;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        settling = true;
        settle = {};
      }),
    );
  }

  /** Puts every icon back in its original spot, forgetting where they were dragged */
  export function reset() {
    const before = placed;
    const after = resolve({}, cols, rows);
    const offsets = {};
    for (const [id, cell] of Object.entries(after)) {
      offsets[id] = {
        x: cellX(before[id]) - cellX(cell),
        y: cellY(before[id]) - cellY(cell),
      };
    }
    easeFrom(offsets);
    preferred = {};
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable; nothing was saved anyway
    }
  }

  function handleOpen(icon) {
    if (suppressClick) return;
    onOpen(icon);
  }

  function offsetFor(id) {
    if (drag?.active && drag.id === id) return { x: drag.dx, y: drag.dy };
    return settle[id] ?? { x: 0, y: 0 };
  }
</script>

<div
  class="icon-grid"
  style:--icon-w="{ICON_W}px"
  style:--icon-h="{ICON_H}px"
  bind:clientWidth={width}
  bind:clientHeight={height}
  in:fade={{ duration: 300, delay: 100 }}
>
  {#if dropCell}
    <div
      class="drop-target"
      style:left="{cellX(dropCell)}px"
      style:top="{cellY(dropCell)}px"
    ></div>
  {/if}

  {#each icons as icon, i (icon.id)}
    {@const cell = placed[icon.id]}
    {@const offset = offsetFor(icon.id)}
    {@const dragging = drag?.active && drag.id === icon.id}
    <!-- Pointer-only drag handle; the icon inside stays the focusable button that opens it -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="grid-item"
      class:dragging
      class:settling
      style:left="{cellX(cell)}px"
      style:top="{cellY(cell)}px"
      style:transform="translate({offset.x}px, {offset.y}px)"
      onpointerdown={(e) => handlePointerDown(e, icon)}
      in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}
    >
      <DesktopIcon {icon} lifted={dragging} onclick={() => handleOpen(icon)} />
    </div>
  {/each}
</div>

<style>
  .icon-grid {
    position: absolute;
    inset: 0;
  }

  .grid-item {
    position: absolute;
    touch-action: none;
    user-select: none;
  }

  .grid-item.settling {
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .grid-item.dragging {
    z-index: 2;
    cursor: grabbing;
  }

  /* Where the icon will land: a dashed ink outline over a halftone wash */
  .drop-target {
    position: absolute;
    width: var(--icon-w);
    height: var(--icon-h);
    border: 2px dashed var(--color-ink);
    border-radius: 12px;
    background-image: var(--halftone);
    background-size: var(--halftone-size);
    background-color: var(--color-paper);
    opacity: 0.45;
    pointer-events: none;
  }
</style>
