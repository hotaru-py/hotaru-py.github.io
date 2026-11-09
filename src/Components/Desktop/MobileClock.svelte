<script>
  import { fade } from "svelte/transition";

  /**
   * @typedef {Object} Props
   * @property {Date} currentTime
   * @property {string | null} [note] Small print under the time (the wallpaper's data credit)
   */

  /** @type {Props} */
  let { currentTime, note = null } = $props();

  // "Tue, 13 Oct"
  const date = $derived.by(() => {
    const parts = new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).formatToParts(currentTime);
    const get = (type) => parts.find((p) => p.type === type)?.value;
    return `${get("weekday")}, ${get("day")} ${get("month")}`;
  });

  // Follows the visitor's locale; the AM/PM marker, if any, is split out so it can sit small
  const time = $derived.by(() => {
    const parts = new Intl.DateTimeFormat([], {
      hour: "numeric",
      minute: "2-digit",
    }).formatToParts(currentTime);
    return {
      text: parts
        .filter((p) => p.type !== "dayPeriod")
        .map((p) => p.value)
        .join("")
        .trim(),
      period: parts.find((p) => p.type === "dayPeriod")?.value ?? "",
    };
  });
</script>

<time
  class="mobile-clock"
  datetime={currentTime.toISOString()}
  data-wallpaper-sample
>
  <span class="clock-date">{date}</span>
  <span class="clock-time">
    {time.text}{#if time.period}<span class="clock-period">{time.period}</span
      >{/if}
  </span>
  {#if note}
    <span class="clock-note" transition:fade={{ duration: 300 }}>{note}</span>
  {/if}
</time>

<style>
  /* Top centre of the home screen; --clock-ink is set by the wallpaper to suit what is
     behind it (data-wallpaper-sample tells the wallpaper where to look) */
  .mobile-clock {
    position: absolute;
    top: calc(clamp(72px, 13vh, 140px) + env(safe-area-inset-top, 0px));
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    pointer-events: none;
    user-select: none;
    color: var(--clock-ink, var(--color-ink));
    transition: color 0.5s ease;
  }

  .clock-date {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 0.02em;
    opacity: 0.8;
  }

  .clock-time {
    font-size: clamp(64px, 24vw, 104px);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.03em;
    font-variant-numeric: tabular-nums;
  }

  /* Paper backing keeps it readable over a busy wallpaper */
  .clock-note {
    margin-top: 4px;
    padding: 1px 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--color-moss-50) 85%, transparent);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: var(--color-ink-muted);
  }

  .clock-period {
    margin-left: 6px;
    font-size: 0.24em;
    letter-spacing: 0.02em;
    vertical-align: 0.9em;
  }
</style>
