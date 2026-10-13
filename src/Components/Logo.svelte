<script>
  import { LOGO_PATH, LOGO_VIEWBOX, LOGO_ASPECT } from "../lib/logo.js";
</script>

<!-- Solid logo mark in the current text color; it fills the height of its container -->
<svg
  class="logo"
  viewBox={LOGO_VIEWBOX}
  style:aspect-ratio={LOGO_ASPECT}
  fill="currentColor"
  aria-hidden="true"
  focusable="false"
>
  <path d={LOGO_PATH} />
</svg>

<style>
  .logo {
    display: block;
    height: 100%;
    width: auto;
  }
</style>
