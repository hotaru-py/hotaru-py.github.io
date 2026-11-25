// links from one part of the site to another (an experience entry to its project, a
// gallery picture to its blog post...). a target is one of:
//   { file: "live-miniture" | "project-p5-rain" | "gallery-<folder>-<item>" }
//   { post: "<blog post id>" }
//   { app: "projects" | "blog" | "gallery" | ... }   (a desktop app, by its icon id)
//   { url: "https://..." }
// the desktop opens these as windows (Desktop.svelte's openTarget); Simple Mode turns
// them into its own #section links with simpleHref()

import { liveWork, projects } from "./siteContent.js";

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Simple Mode's tabs, by desktop app id
const SIMPLE_TABS = {
  about: "about",
  experience: "experience",
  projects: "projects",
  gallery: "gallery",
  blog: "blog",
  skills: "skills",
  browser: "links",
};

/** where a target goes in Simple Mode, or null if it has nowhere to go there */
export function simpleHref(target) {
  if (!target) return null;
  if (target.url) return target.url;
  if (target.post) return `#blog/${target.post}`;
  if (target.app) return SIMPLE_TABS[target.app] ? `#${SIMPLE_TABS[target.app]}` : null;
  const key = target.file ?? "";
  const live = liveWork.find((site) => `live-${site.id}` === key);
  if (live) return `#projects/${slug(live.name)}`;
  const project = projects.find((p) => `project-${slug(p.name)}` === key);
  if (project) return `#projects/${slug(project.name)}`;
  if (key.startsWith("gallery-")) return "#gallery";
  return null;
}

/** an experience entry's pictures (its `media`), or none */
export function entryMedia(entry) {
  return entry.media ?? [];
}
