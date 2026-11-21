<script module>
  import { preloadImages } from "../lib/preload.js";
  import { workShots } from "../lib/workFiles.js";

  preloadImages(workShots);
</script>

<script>
  import FileExplorer from "./FileExplorer.svelte";
  import { githubProfile } from "../lib/siteContent.js";
  import { liveFiles, projectFiles } from "../lib/workFiles.js";

  let { isMobile = false } = $props();

  const folders = [
    { id: "live", name: "Live Work", files: liveFiles },
    {
      id: "personal",
      name: "Personal Projects",
      files: projectFiles,
      link: { label: "GitHub", url: githubProfile },
    },
  ];
</script>

<FileExplorer rootName="Projects" {folders} {isMobile} />
