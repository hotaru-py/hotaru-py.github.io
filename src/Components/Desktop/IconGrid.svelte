<script>
  import { fade, fly } from "svelte/transition";
  import DesktopIcon from "./DesktopIcon.svelte";

  /**
   * The desktop's icons and widgets on one snapping grid. Icons take a cell; a widget
   * takes a block of cells (`span`). Both drag, snap, animate and reset the same way.
   * @typedef {{ col: number, row: number }} Cell
   * @typedef {Object} Props
   * @property {any[]} icons Icons, then any widgets: `{ id, widget: Snippet, span: { cols, rows }, square? }`
   * @property {(icon: any) => void} onOpen
   * @property {boolean} [customized] Out: whether anything is away from its default spot
   */

  /** @type {Props} */
  let { icons, onOpen, customized = $bindable(false) } = $props();

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

  const spanOf = (item) => item.span ?? { cols: 1, rows: 1 };

  // Where the visitor put each item; the grid resolves these against its current size
  /** @type {Record<string, Cell>} */
  let preferred = $state(loadPreferred());

  /** @type {Record<string, Cell>} */
  const placed = $derived(resolve(preferred, cols, rows));

  // Compares where items actually are with a fresh layout, so dragging one back to its
  // original cell counts as unchanged too
  $effect(() => {
    const defaults = resolve({}, cols, rows);
    customized = icons.some(
      (icon) => key(placed[icon.id]) !== key(defaults[icon.id]),
    );
  });

  /** @type {null | { id: string, pointerId: number, startX: number, startY: number, dx: number, dy: number, active: boolean }} */
  let drag = $state(null);
  // Offset an item animates back from after it is dropped
  /** @type {Record<string, { x: number, y: number }>} */
  let settle = $state({});
  let settling = $state(false);
  let suppressClick = false;

  const dragged = $derived(
    drag?.active ? icons.find((icon) => icon.id === drag.id) : null,
  );
  const dropCell = $derived.by(() => {
    if (!dragged) return null;
    const from = placed[dragged.id];
    const col = Math.round(from.col + drag.dx / pitchX);
    const row = Math.round(from.row + drag.dy / pitchY);
    return nearestFree(
      { col, row },
      spanOf(dragged),
      occupiedExcept(dragged.id),
      cols,
      rows,
    );
  });

  const cellX = (cell) => MARGIN + cell.col * pitchX;
  const cellY = (cell) => MARGIN + cell.row * pitchY;
  // A block of cells, from the first cell's corner to the far edge of the last one
  const spanW = (span) => (span.cols - 1) * pitchX + ICON_W;
  const spanH = (span) => (span.rows - 1) * pitchY + ICON_H;
  // What an item actually covers: square widgets are as tall as they are wide, inside
  // their (taller) block of cells, and the drop outline should match that
  const boxW = (item) => spanW(spanOf(item));
  const boxH = (item) =>
    item.square ? Math.min(boxW(item), spanH(spanOf(item))) : spanH(spanOf(item));

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

  // Give every item an in-bounds block of free cells, honouring preferences where
  // possible. Without a preference:
  //   corner "top-right"     (widgets) sit against the top-right, `cornerColOffset`
  //                          cells in from the right and `cornerRowOffset` down
  //   corner "bottom-right"  start in the last cell (or `cornerRowOffset` above it)
  //   anything else          fills columns top to bottom, like a fresh desktop
  // Widgets are placed first, so the big blocks get their spots before the icons.
  function resolve(prefs, cols, rows) {
    const taken = new Set();
    /** @type {Record<string, Cell>} */
    const out = {};
    let flow = 0;
    const order = [
      ...icons.filter((icon) => icon.corner === "top-right"),
      ...icons.filter((icon) => icon.corner !== "top-right"),
    ];
    for (const icon of order) {
      const span = spanOf(icon);
      let fallback;
      if (icon.corner === "top-right") {
        fallback = {
          col: cols - span.cols - (icon.cornerColOffset ?? 0),
          row: icon.cornerRowOffset ?? 0,
        };
      } else if (icon.corner === "bottom-right") {
        fallback = {
          col: cols - 1,
          row: Math.max(0, rows - 1 - (icon.cornerRowOffset ?? 0)),
        };
      } else {
        fallback = { col: Math.floor(flow / rows), row: flow % rows };
        flow++;
      }
      const cell = nearestFree(prefs[icon.id] ?? fallback, span, taken, cols, rows);
      for (const c of cellsOf(cell, span)) taken.add(key(c));
      out[icon.id] = cell;
    }
    return out;
  }

  function cellsOf(cell, span) {
    const out = [];
    for (let c = 0; c < span.cols; c++) {
      for (let r = 0; r < span.rows; r++) {
        out.push({ col: cell.col + c, row: cell.row + r });
      }
    }
    return out;
  }

  function occupiedExcept(id) {
    const taken = new Set();
    for (const icon of icons) {
      if (icon.id === id || !placed[icon.id]) continue;
      for (const c of cellsOf(placed[icon.id], spanOf(icon))) taken.add(key(c));
    }
    return taken;
  }

  const key = (cell) => `${cell.col},${cell.row}`;

  // Whether a block fits there: inside the grid, on no taken cell
  function fits(cell, span, taken, cols, rows) {
    if (cell.col < 0 || cell.row < 0) return false;
    if (cell.col + span.cols > cols || cell.row + span.rows > rows) return false;
    return cellsOf(cell, span).every((c) => !taken.has(key(c)));
  }

  // Closest spot to `wanted` where the block fits (clamped into the grid); if nothing
  // fits at all, it overlaps rather than vanishing
  function nearestFree(wanted, span, taken, cols, rows) {
    const target = {
      col: Math.min(Math.max(wanted.col, 0), Math.max(0, cols - span.cols)),
      row: Math.min(Math.max(wanted.row, 0), Math.max(0, rows - span.rows)),
    };
    if (fits(target, span, taken, cols, rows)) return target;

    let best = null;
    let bestDist = Infinity;
    for (let col = 0; col <= cols - span.cols; col++) {
      for (let row = 0; row <= rows - span.rows; row++) {
        if (!fits({ col, row }, span, taken, cols, rows)) continue;
        const dist = (col - target.col) ** 2 + (row - target.row) ** 2;
        if (dist < bestDist) {
          best = { col, row };
          bestDist = dist;
        }
      }
    }
    if (best) return best;
    if (span.cols > 1 || span.rows > 1) return target;

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
      window.getSelection()?.removeAllRanges();
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

      // The click that follows this pointerup shouldn't open anything
      suppressClick = true;
      setTimeout(() => (suppressClick = false));
    }
    drag = null;
  }

  // Start items at these offsets from their cells, then ease them into place
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

  /**
   * Right edge (px from the desktop's left) of the icons on the left half of the
   * desktop, so a window can open just clear of them. Null until the grid is measured.
   */
  export function leftIconsRight() {
    if (!width) return null;
    let right = 0;
    for (const icon of icons) {
      const cell = placed[icon.id];
      if (cell && cell.col < cols / 2) {
        right = Math.max(right, cellX(cell) + spanW(spanOf(icon)));
      }
    }
    return right;
  }

  /** Puts everything back in its original spot, forgetting where it was dragged */
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

  // A drop shouldn't also count as a click on whatever is inside a widget
  function handleWidgetClick(e) {
    if (!suppressClick) return;
    e.stopPropagation();
    e.preventDefault();
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
      style:width="{boxW(dragged)}px"
      style:height="{boxH(dragged)}px"
    ></div>
  {/if}

  {#each icons as icon, i (icon.id)}
    {@const cell = placed[icon.id]}
    {@const offset = offsetFor(icon.id)}
    {@const dragging = drag?.active && drag.id === icon.id}
    <!-- Pointer-only drag handle; what's inside stays clickable and focusable -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="grid-item"
      class:widget={icon.widget}
      class:dragging
      class:settling
      style:left="{cellX(cell)}px"
      style:top="{cellY(cell)}px"
      style:width={icon.widget ? `${boxW(icon)}px` : undefined}
      style:height={icon.widget ? `${boxH(icon)}px` : undefined}
      style:transform="translate({offset.x}px, {offset.y}px)"
      onpointerdown={(e) => handlePointerDown(e, icon)}
      onclickcapture={icon.widget ? handleWidgetClick : undefined}
      in:fly={{ y: 20, duration: 200, delay: 300 + i * 50 }}
    >
      {#if icon.widget}
        <div class="widget-body" class:lifted={dragging}>
          {@render icon.widget()}
        </div>
      {:else}
        <DesktopIcon {icon} lifted={dragging} onclick={() => handleOpen(icon)} />
      {/if}
    </div>
  {/each}
</div>

<style>
  .icon-grid {
    position: absolute;
    inset: 0 0 var(--taskbar-space, 0px);
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

  .grid-item.dragging :global(*) {
    cursor: grabbing;
  }

  /* Widgets: the content fills the block of cells and tilts up when picked up, like an
     icon's tile does */
  .widget-body {
    width: 100%;
    height: 100%;
    transition: transform 0.15s ease;
  }

  .widget-body.lifted {
    transform: translate(-3px, -3px) rotate(-2deg);
  }

  /* Where it will land: a dashed ink outline over a halftone wash */
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
    box-sizing: border-box;
  }
</style>
