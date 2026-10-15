// Build-time outputs for search engines and AI agents, all generated from siteContent.js:
// the <head> tags, a plain-HTML copy of the content baked into index.html (for crawlers
// and visitors without JavaScript), /llms.txt, /robots.txt and /sitemap.xml.
// Used by the plugin in vite.config.js; runs in Node, so no browser APIs here.

import {
  site,
  about,
  experience,
  skillCategories,
  liveWork,
  githubProfile,
  projects,
  bookmarks,
  plain,
  starLabel,
  schoolName,
} from "./siteContent.js";

const OG_IMAGE = "og-image.jpg";
const SITE_NAME = "hotaru's PC";

const absolute = (path) => new URL(path, site.url).href;
const simpleModeUrl = absolute("?mode=simple");

/** Escapes text for HTML content and attribute values */
function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** **emphasis** to <strong>, with everything else escaped */
function richHtml(text) {
  return text
    .split("**")
    .map((part, i) => (i % 2 ? `<strong>${esc(part)}</strong>` : esc(part)))
    .join("");
}

function linkHtml(url, label) {
  const external = /^https?:/.test(url);
  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  return `[ <a href="${esc(url)}"${attrs}>${esc(label)}</a> ]`;
}

// --------------------------------------------------------------------------- <head>

function structuredData() {
  const sameAs = bookmarks
    .map((b) => b.url)
    .filter((url) => url.startsWith("http"));
  const email = bookmarks.find((b) => b.url.startsWith("mailto:"))?.url;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}#person`,
        name: site.name,
        alternateName: site.handle,
        url: site.url,
        jobTitle: site.jobTitle,
        ...(email && { email }),
        sameAs,
        alumniOf: about.education.map((entry) => ({
          "@type": entry.type,
          name: entry.school,
        })),
        knowsAbout: skillCategories.flatMap((c) => c.items),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}#website`,
        url: site.url,
        name: SITE_NAME,
        description: site.description,
        inLanguage: "en",
        author: { "@id": `${site.url}#person` },
      },
    ],
  };
}

export function renderHeadTags() {
  const image = absolute(OG_IMAGE);
  const imageAlt = `${site.name} (${site.handle}), ${site.jobTitle}`;
  // "<" escaped so the JSON can never close the script tag early
  const jsonLd = JSON.stringify(structuredData()).replaceAll("<", "\\u003c");
  return [
    `<title>${esc(site.title)}</title>`,
    `<meta name="description" content="${esc(site.description)}" />`,
    `<meta name="author" content="${esc(site.name)}" />`,
    `<link rel="canonical" href="${esc(site.url)}" />`,
    `<link rel="alternate" type="text/plain" href="/llms.txt" title="Plain-text summary for AI agents (llms.txt)" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:title" content="${esc(site.title)}" />`,
    `<meta property="og:description" content="${esc(site.description)}" />`,
    `<meta property="og:url" content="${esc(site.url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(site.title)}" />`,
    `<meta name="twitter:description" content="${esc(site.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    // Not the hidden attribute: Tailwind's reset forces that with a layered !important,
    // which the <noscript> override in renderStaticPage() could never beat
    `<style>#static-content { display: none; }</style>`,
  ].join("\n    ");
}

// ------------------------------------------------------- Plain-HTML copy of the content

export function renderStaticPage() {
  const li = (html) => `<li>${html}</li>`;
  const html = [
    `<header>`,
    `<h1>${esc(site.name)} (${esc(site.handle)})</h1>`,
    `<p>${esc(site.jobTitle)}</p>`,
    `</header>`,

    `<section><h2>About</h2>`,
    `<p>${esc(about.greeting)} (${esc(about.pronouns)})</p>`,
    ...about.intro.map((p) => `<p>${esc(p)}</p>`),
    `<ul>${about.interests.map((item) => li(richHtml(item))).join("")}</ul>`,
    `<p>${esc(about.outro)}</p>`,
    `<h3>Education</h3>`,
    `<ul>`,
    ...about.education.map((entry) =>
      li(
        `<strong>${esc(schoolName(entry))}</strong>${entry.lines.map((line) => `<br />${esc(line)}`).join("")}`,
      ),
    ),
    `</ul>`,
    `</section>`,

    `<section><h2>Experience</h2><ul>`,
    ...experience.map((job) =>
      li(
        `<strong>${esc(job.role)}</strong><br />${linkHtml(job.url, job.company)} (${esc(job.period)})`,
      ),
    ),
    `</ul></section>`,

    `<section><h2>Skills</h2>`,
    ...skillCategories.map(
      (c) => `<h3>${esc(c.name)}</h3><p>${c.items.map(esc).join(" · ")}</p>`,
    ),
    `</section>`,

    `<section><h2>Work</h2>`,
    `<h3>Live Work</h3><ul>`,
    ...liveWork.map((w) =>
      li(`<strong>${esc(w.name)}</strong><br />${linkHtml(w.url, w.domain)}`),
    ),
    `</ul><h3>Personal Projects</h3><ul>`,
    ...projects.map((p) => {
      const stars = p.stars
        ? `<br />★ ${esc(starLabel(p.stars.fallback))}`
        : "";
      return li(
        `<strong>${esc(p.name)}</strong>: ${esc(p.description)}${stars}<br />${linkHtml(p.link, "View on GitHub")}`,
      );
    }),
    `</ul><p>More on ${linkHtml(githubProfile, "GitHub")}</p>`,
    `</section>`,

    `<section><h2>Links</h2><ul>`,
    ...bookmarks.map((b) => li(linkHtml(b.url, b.name))),
    `</ul></section>`,
  ].join("\n");

  // Hidden once JavaScript runs (the app shows the same content); shown as a plain,
  // monospace page when it doesn't
  // Sections carry no ids: Simple Mode uses those for its in-page links, and duplicates
  // here would send them to this hidden copy
  return `<div id="static-content">
${html}
</div>
    <noscript><style>
      html, body { height: auto !important; overflow: auto !important; background: #f1f1da; }
      #static-content { display: block !important; max-width: 72ch; margin: 0 auto; padding: 48px 20px;
        font: 15px/1.7 "JetBrains Mono", ui-monospace, Menlo, Consolas, monospace; color: #132310; }
      #static-content h2 { margin-top: 40px; }
      #static-content h1 { font-size: 22px; font-weight: 700; }
      #static-content h2 { font-size: 18px; font-weight: 700; }
      #static-content h3 { font-size: 15px; font-weight: 700; margin-top: 24px; }
      #static-content p, #static-content ul { margin-top: 12px; }
      #static-content li { padding-left: 2ch; text-indent: -2ch; margin-top: 6px; }
      #static-content li::before { content: "- "; color: #4b732b; }
      #static-content a { color: inherit; font-weight: 700; }
    </style></noscript>`;
}

// ------------------------------------------------------------------------ /llms.txt
// Format: https://llmstxt.org

export function renderLlmsTxt() {
  const lines = [
    `# ${site.name} (${site.handle})`,
    "",
    `> ${site.description}`,
    "",
    about.intro[0],
    "",
    `This site (${site.url}) is an interactive, desktop-style portfolio that needs JavaScript. A plain-text version of the same content is at ${simpleModeUrl}, and everything is summarised below.`,
    "",
    "## About",
    "",
    ...about.interests.map((item) => `- ${plain(item)}`),
    ...about.education.map(
      (entry) => `- Education: ${schoolName(entry)}, ${entry.lines.join("; ")}`,
    ),
    `- Pronouns: ${about.pronouns}`,
    "",
    "## Experience",
    "",
    ...experience.map(
      (job) => `- [${job.company}](${job.url}): ${job.role}, ${job.period}`,
    ),
    "",
    "## Skills",
    "",
    ...skillCategories.map((c) => `- ${c.name}: ${c.items.join(", ")}`),
    "",
    "## Live Work",
    "",
    ...liveWork.map((w) => `- [${w.name}](${w.url}): live website`),
    "",
    "## Personal Projects",
    "",
    ...projects.map((p) => {
      const stars = p.stars ? ` (${starLabel(p.stars.fallback)})` : "";
      return `- [${p.name}](${p.link}): ${p.description}${stars}`;
    }),
    `- [More on GitHub](${githubProfile})`,
    "",
    "## Contact and profiles",
    "",
    ...bookmarks.map((b) => `- [${b.name}](${b.url})`),
    "",
    "## Optional",
    "",
    `- [Plain-text version of the site](${simpleModeUrl}): the same content without the desktop interface`,
    "",
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------- /robots.txt, /sitemap.xml

export function renderRobotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# Plain-text summary of this site for AI agents and LLMs (https://llmstxt.org):",
    `# ${absolute("llms.txt")}`,
    "",
    `Sitemap: ${absolute("sitemap.xml")}`,
    "",
  ].join("\n");
}

/** @param {Date} builtAt */
export function renderSitemap(builtAt) {
  const lastmod = builtAt.toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${esc(site.url)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`;
}
