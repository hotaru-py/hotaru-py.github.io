// The files behind the Projects and Gallery explorers: live sites, personal projects and
// gallery pictures from siteContent.js, shaped alike so one explorer and one file viewer
// handle them all.

import minitureShot from "../assets/work-miniture.webp";
import tccShot from "../assets/work-tcc.webp";
import inventeShot from "../assets/work-invente.webp";
import instinctsShot from "../assets/work-instincts.webp";
import { liveWork, projects, gallery } from "./siteContent.js";
import { placeholderArt } from "./placeholderArt.js";
import FileViewer from "../Components/FileViewer.svelte";

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
  // A page of text: the licence window's taskbar icon
  text: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M14 2.5V8h5.5z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 12h8M8 15.5h5.5M8 19h7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  folder: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="url(#halftone)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 10h20v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  // p5.rain: a canvas of rain cells at different sizes, like its Breathe style
  rain: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="2.5" width="19" height="19" rx="3" style="fill: var(--color-paper)" stroke="currentColor" stroke-width="2"/><rect x="6" y="6" width="3" height="3" fill="currentColor"/><rect x="11" y="6.5" width="2" height="2" fill="currentColor"/><rect x="14.5" y="5.5" width="4" height="4" fill="url(#halftone)" stroke="currentColor" stroke-width="1"/><rect x="6.5" y="11" width="2" height="2" fill="currentColor"/><rect x="10" y="10" width="4" height="4" fill="currentColor"/><rect x="15.5" y="11" width="2" height="2" fill="currentColor"/><rect x="5.5" y="14.5" width="4" height="4" fill="url(#halftone)" stroke="currentColor" stroke-width="1"/><rect x="11" y="15.5" width="2" height="2" fill="currentColor"/><rect x="15" y="15" width="3" height="3" fill="currentColor"/></svg>`,
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
 * @property {"live" | "project" | "gallery"} kind
 * @property {string} typeLabel Shown as the file's Type in the viewer
 * @property {string} [linkText] The viewer's button text (with `url`)
 * @property {string} [alt] Alt text for `image`
 * @property {string} [date] ISO date, shown in the viewer
 * @property {string} name
 * @property {string} fileName What the explorer would call it on disk
 * @property {string} [description]
 * @property {string} [url]
 * @property {string} [linkLabel]
 * @property {string} [image]
 * @property {{ repo: string, fallback: number }} [stars]
 * @property {"p5rain"} [demo] Shown live in the viewer instead of a picture
 * @property {string} [icon] Overrides the kind's icon (explorer and taskbar)
 */

/** @type {WorkFile[]} */
export const liveFiles = liveWork.map((site) => ({
  key: `live-${site.id}`,
  kind: "live",
  typeLabel: "Live website",
  linkText: "Visit website",
  alt: `Screenshot of the ${site.name} website`,
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
  typeLabel: "Personal project",
  linkText: "View project",
  name: project.name,
  fileName: `${slug(project.name)}.repo`,
  description: project.description,
  url: project.link,
  linkLabel: project.link.replace(/^https:\/\/(www\.)?/, ""),
  stars: project.stars,
  demo: project.demo,
  icon: project.demo ? FILE_ICONS.rain : undefined,
}));

/**
 * The Gallery's subfolders and their pictures, as files
 * @type {{ id: string, name: string, files: WorkFile[] }[]}
 */
export const galleryFolders = gallery.map((folder) => ({
  id: folder.id,
  name: folder.name,
  files: folder.items.map((item) => ({
    key: `gallery-${folder.id}-${item.id}`,
    kind: "gallery",
    typeLabel: folder.typeLabel,
    name: item.title,
    fileName: `${item.id}.png`,
    description: item.description,
    date: item.date,
    image: item.image ?? placeholderArt(item.id, item.title),
    alt: item.title,
    icon: FILE_ICONS.live,
  })),
}));

/** Every gallery picture, folder by folder (the phone's gallery widget cycles these) */
export const galleryFiles = galleryFolders.flatMap((folder) => folder.files);

/**
 * What Desktop.svelte's openWindow needs to show a file, so every way of opening one
 * (explorer, widget) opens and brings forward the same window.
 * @param {WorkFile} file
 */
export function fileWindow(file) {
  return {
    id: file.key,
    title: file.name,
    icon: file.icon ?? FILE_ICONS[file.kind],
    component: FileViewer,
    props: { file },
    // Demos get more room for the artwork next to the details panel
    size: file.demo ? { width: 980, height: 600 } : { width: 820, height: 500 },
  };
}
