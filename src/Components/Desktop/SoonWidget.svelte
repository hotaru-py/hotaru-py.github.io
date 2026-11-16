<script>
  /**
   * Square home-screen widget holding the gallery's spot until there's work to show:
   * dashed outline, three rain cells taking turns, and a line saying so.
   */
</script>

<div class="widget" role="note">
  <span class="cells" aria-hidden="true"
    ><span></span><span></span><span></span></span
  >
  <span class="text">something will be here soon</span>
</div>

<style>
  .widget {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    aspect-ratio: 1;
    box-sizing: border-box;
    padding: 14px;
    border: 2px dashed var(--color-ink);
    border-radius: 20px;
    background: color-mix(in srgb, var(--color-paper) 80%, transparent);
    color: var(--color-ink-soft);
    text-align: center;
  }

  .cells {
    display: flex;
    gap: 5px;
  }

  .cells span {
    width: 9px;
    height: 9px;
    background: var(--color-moss-600);
    animation: cell 1.4s ease-in-out infinite;
  }

  .cells span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .cells span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes cell {
    0%,
    100% {
      transform: scale(0.5);
      opacity: 0.4;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cells span {
      animation: none;
    }
  }

  .text {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.35;
  }
</style>
