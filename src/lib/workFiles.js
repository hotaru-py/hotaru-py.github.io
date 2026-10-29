// The Work window's files: live sites and personal projects from siteContent.js,
// shaped the same way so the explorer and the file viewer can treat them alike.

import minitureShot from "../assets/work-miniture.webp";
import tccShot from "../assets/work-tcc.webp";
import inventeShot from "../assets/work-invente.webp";
import instinctsShot from "../assets/work-instincts.webp";
import { liveWork, projects } from "./siteContent.js";

// Screenshot for each live site, by its id in siteContent.js
const shots = {
  miniture: minitureShot,
  invente: inventeShot,
  instincts: instinctsShot,
  tcc: tccShot,
};

export const workShots = Object.values(shots);

// Ink line icons in the desktop's style; shaded areas use the #halftone pattern that
// Desktop.svelte defines. Used for the taskbar buttons and the repo file thumbnails.
export const FILE_ICONS = {
  live: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="4" width="19" height="16" rx="2" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/><path d="M2.5 16.5l5-5 4 4 3-3 7 7" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="16" cy="8.5" r="1.5" fill="currentColor"/></svg>`,
  project: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 2.5V8h5.5z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 12.5l-2.5 2.5 2.5 2.5M14 12.5l2.5 2.5-2.5 2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * @typedef {Object} WorkFile
 * @property {string} key Unique across both folders; also the viewer window's id
 * @property {"live" | "project"} kind
 * @property {string} name
 * @property {string} fileName What the explorer would call it on disk
 * @property {string} [description]
 * @property {string} url
 * @property {string} linkLabel
 * @property {string} [image]
 * @property {{ repo: string, fallback: number }} [stars]
 */

/** @type {WorkFile[]} */
export const liveFiles = liveWork.map((site) => ({
  key: `live-${site.id}`,
  kind: "live",
  name: site.name,
  fileName: `${site.id}.webp`,
  description: site.description,
  url: site.url,
  linkLabel: site.domain,
  image: shots[site.id],
}));

/** @type {WorkFile[]} */
export const projectFiles = projects.map((project) => ({
  key: `project-${slug(project.name)}`,
  kind: "project",
  name: project.name,
  fileName: `${slug(project.name)}.repo`,
  description: project.description,
  url: project.link,
  linkLabel: project.link.replace(/^https:\/\/(www\.)?/, ""),
  stars: project.stars,
}));
