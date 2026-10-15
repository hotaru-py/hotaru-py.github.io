import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import {
  renderHeadTags,
  renderStaticPage,
  renderLlmsTxt,
  renderRobotsTxt,
  renderSitemap,
} from "./src/lib/staticSite.js";

// SEO and crawler files, generated from src/lib/siteContent.js. In dev, restart the
// server after editing that file to see these update (the app itself hot-reloads).
function siteSeo() {
  const textFiles = () => ({
    "llms.txt": { type: "text/plain", body: renderLlmsTxt() },
    "robots.txt": { type: "text/plain", body: renderRobotsTxt() },
    "sitemap.xml": { type: "application/xml", body: renderSitemap(new Date()) },
  });

  return {
    name: "site-seo",
    transformIndexHtml(html) {
      return html
        .replace("<!-- seo:head -->", renderHeadTags())
        .replace("<!-- seo:static-content -->", renderStaticPage());
    },
    generateBundle() {
      for (const [fileName, file] of Object.entries(textFiles())) {
        this.emitFile({ type: "asset", fileName, source: file.body });
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const file = textFiles()[req.url?.slice(1) ?? ""];
        if (!file) return next();
        res.setHeader("Content-Type", `${file.type}; charset=utf-8`);
        res.end(file.body);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [tailwindcss(), svelte(), siteSeo()],
});
