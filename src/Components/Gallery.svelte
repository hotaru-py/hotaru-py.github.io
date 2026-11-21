<script>
  import FileExplorer from "./FileExplorer.svelte";
  import { galleryFolders } from "../lib/workFiles.js";

  let { isMobile = false } = $props();
</script>

<!-- art, UI/UX mockups, graphic design and photos, each a subfolder -->
<FileExplorer rootName="Gallery" folders={galleryFolders} {isMobile} />
