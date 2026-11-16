<script>
  import FileExplorer from "./FileExplorer.svelte";
  import { galleryFolders } from "../lib/workFiles.js";

  /**
   * @typedef {Object} Props
   * @property {boolean} [isMobile]
   */

  /** @type {Props} */
  let { isMobile = false } = $props();
</script>

<!-- Art, UI/UX mockups, graphic design and photos, each a subfolder -->
<FileExplorer rootName="Gallery" folders={galleryFolders} {isMobile} />
