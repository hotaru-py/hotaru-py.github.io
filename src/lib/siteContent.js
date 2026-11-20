// Everything the site says, in one place. The desktop windows, Simple Mode, the static
// copy baked into index.html for crawlers, and /llms.txt are all built from this file,
// so edit content here. Plain data only (no asset imports): vite.config.js reads it too.
//
// Text may use **double asterisks** for emphasis; see emphasis() below.

export const site = {
  url: "https://www.byhotaru.com/",
  name: "hotaru",
  handle: "hotarumakes",
  title: "hotaru | i make stuff that looks good to me",
  description:
    "random infodump about the individual known as Prajesh (or) hotaru",
  jobTitle: "mix of a designer-developer",
};

// The copyright notice, shown in the About window and Simple Mode's footer. The end year
// is always the current one.
export const copyright = { holder: "Prajesh Raam / hotaru", since: 2024 };

/** "© 2024-2026 Prajesh Raam" */
export function copyrightLine(year = new Date().getFullYear()) {
  const years =
    year > copyright.since
      ? `${copyright.since}-${year}`
      : `${copyright.since}`;
  return ` © ${years} ${copyright.holder}`;
}

export const about = {
  greeting: "Hello, I'm hotaru (^_^)/",
  // Shown under the greeting
  realName: "Prajesh Raam",
  pronouns: "he/him",
  // Shown first, on its own line
  tldr: "tl;dr: I make stuff that looks good to me.",
  intro: [
    "Usually, I'm a frustrated consumer trying to fix things around me with my weird concoction of design, engineering and other skills, so they're usable and look good.",
    "Professionally, I'm a designer, engineer and artist working primarily in product engineering, trying to understand how humans have interacted with technology in the past and present, and work on how we'll interact with technology in the near and far future, especially with calm and ambient interfaces.",
    "Other than these, I sometimes do the following (and a lot more, I just can't keep track of them):",
  ],
  // The list after the intro
  interests: [
    "Play the piano",
    "Random doodling",
    "Poke into electronics",
    "Video games (old and new)",
    "Play some tennis",
    "Watch Movies/TV/Anime",
    "Listen to music (playlist more diverse than a friend group in a college brochure)",
    "Can't think of anything else at this hour, will add more later",
  ],
  // Most recent first. `board` is shown after the name ("School - CBSE"); `type` is the
  // schema.org kind of school, for search engines
  education: [
    {
      school: "Shiv Nadar University Chennai",
      type: "CollegeOrUniversity",
      lines: ["B.Tech Artificial Intelligence and Data Science (2023-2027)"],
    },
    {
      school: "Mahatma Global Gateway",
      board: "CBSE",
      type: "HighSchool",
      lines: ["Computer Science & Mathematics (2023)"],
    },
  ],
};

// Most recent first; `url` is optional (freelancing has no company page)
export const experience = [
  {
    role: "Software Development Engineering Intern",
    company: "Miniture",
    url: "https://miniture.in",
    period: "March 2025 - February 2026",
    description:
      "Redesigned and built the company's storefront and mobile app, from design to code. Built the tools that let non-engineers manage pages, data and marketing themselves, then used analytics to keep improving the updated storefront after launch.",
  },
  {
    role: "Web Development, UI/UX & Graphic Design",
    company: "Freelance (on and off)",
    period: "2020 - Present",
    description:
      "Take up a few projects here and there, whenever I'm free (and require a source of income).",
  },
];

// College clubs and activities, shown after work experience. Each club lists its roles,
// most recent first. `url` (club or job), `description` (job) and `period` and `description` (role) are optional; a description folds open under its role.
export const activities = [
  {
    org: "SNUC Coding Club",
    roles: [
      { role: "Club Head", period: "Jul 2026 - Present" },
      {
        role: "Core Member - Software Development Vertical",
        period: "Sep 2025 - Present",
      },
      {
        role: "Founding Team - Game Development & AR/VR Vertical",
        period: "Sep 2026 - Present",
      },
      { role: "Graphic Designer", period: "Oct 2023 - Aug 2025" },
    ],
  },
  {
    org: "Aura - SNUC Design Club",
    roles: [{ role: "Senior Core Member", period: "Jul 2026 - Present" }],
  },
  {
    org: "Cognition - The SNUC Quiz Club",
    roles: [
      { role: "Club Head", period: "May 2026 - Present" },
      { role: "Core Member", period: "Aug 2024 - May 2026" },
    ],
  },
  {
    org: "Team Edita",
    url: "https://www.editactf.tech",
    roles: [
      {
        role: "Founding member",
        period: "2023 - Present",
        description:
          "Joined a bunch of people I met online to do CTFs, then organized them, and a few more things.",
      },
    ],
  },
  {
    org: "SSN-SNUC MUN Society",
    roles: [
      {
        role: "Under Secretary General - Tech",
        period: "2025 - 2026",
        description:
          "Led the technical development of things the conference used, while building some of the frontend and backend myself.",
      },
      {
        role: "General Administrator - Tech",
        period: "2024 - 2025",
        description:
          "Worked on the design and development of the website, working on most components and pages.",
      },
    ],
  },
  {
    org: "University Work",
    roles: [
      {
        role: "Website Head, SSN-SNUC Invente '26",
        period: "Jul - Sep 2026",
        description:
          "Coordinated design, frontend and backend teams for the website and other technologies used across the technical festival, while building initial identity and a few pages and components in the website myself.",
      },
      {
        role: "Frontend Developer & UI/UX Designer, University Faculty and Student Capstone Portal",
        description:
          "Absolutely hated the UI of the portal, so volunteered to replace it with a visually better, on-brand and significantly more usable interface with a design system implemented for future developers when scope creep happens.",
      },
      {
        role: "Conference Website Developer",
        description: "NCVPRIPG '26 GLOFeagles Challenge & ICACM '27",
      },
      {
        role: "Web Designer & Developer, SSN-SNUC Instincts '26",
        period: "Jan - Mar 2026",
        description:
          "Designed and developed initial identity, components and pages for the university's annual cultural festival, as one of the lead designers and developers.",
      },
      {
        role: "Graphic Designer - Marketing, SNUC",
        period: "Sep 2023 - Mar 2024",
      },
    ],
  },
  // (if anyone from the team is reading this, love y'all, best team)
];

// The phone's Featured widget: something new, or anything worth showing off. `file` is
// the key of a file in the Projects or Gallery windows (it opens there); or give a `url`
// instead. `image` overrides the file's own picture.
export const featured = {
  label: "Featured",
  title: "p5.rain",
  blurb: "Earth's rain as pixel art",
  file: "project-p5-rain",
};

// The Gallery app's subfolders. Hidden for now (the app, its widget and its Simple Mode
// section are commented out in Desktop.svelte, SimpleMode.svelte and staticSite.js);
// bring those back once there's work to show. Each item gets an `image` URL (e.g. from
// public/); without one a placeholder is drawn from its id.
export const gallery = [
  // {
  //   id: "art",
  //   name: "Art",
  //   typeLabel: "Art",
  //   items: [{ id: "…", title: "…", date: "2026-11-17", description: "…", image: "/gallery/….webp" }],
  // },
  // { id: "mockups", name: "UI/UX Mockups", typeLabel: "UI/UX mockup", items: [] },
  // { id: "graphics", name: "Graphic Design", typeLabel: "Graphic design", items: [] },
  // { id: "photos", name: "Photos", typeLabel: "Photo", items: [] },
];

export const skillCategories = [
  {
    name: "Full-Stack Development",
    items: [
      "React",
      "Next.js",
      "JavaScript / TypeScript",
      "Shopify Liquid",
      "Svelte",
      "Python",
      "FastAPI",
      "Flask",
      "Node.js",
      "SQL",
    ],
  },
  {
    name: "Design & Creative",
    items: [
      "Figma",
      "Inkscape",
      "Krita",
      "Canva",
      "Premiere Pro",
      "Blender",
      "Pen & Paper",
    ],
  },
];

// `id` picks the screenshot in the Work window
export const liveWork = [
  {
    id: "miniture",
    name: "Miniture",
    url: "https://www.miniture.in",
    domain: "miniture.in",
    description:
      "Shopify theme built end-to-end as the sole developer, from the designer's handoff through iterations with the team and designer. Continuously improved and extended using customer session data, competitor analysis and brand fit.",
  },
  {
    id: "invente",
    name: "SSN-SNUC INVENTE '26",
    url: "https://invente-2026.vercel.app/",
    domain: "invente-2026.vercel.app",
    description:
      "Website lead for INVENTE, my university's annual technical festival. Led the website team, set the site's initial look and drove its implementation, while also working hands-on as a frontend developer.",
  },
  {
    id: "instincts",
    name: "SSN-SNUC INSTINCTS '26",
    url: "https://www.ssnsnucinstincts.com/",
    domain: "ssnsnucinstincts.com",
    description:
      "Web designer and developer for INSTINCTS, my university's annual cultural festival. Led the design language and page mockups (mainly the home page), then built the site and maintained it and its content.",
  },
  {
    id: "tcc",
    name: "The Curation Company",
    url: "https://www.thecurationcompany.in/",
    domain: "thecurationcompany.in",
    description:
      "Website for a gift curation client. Ideated and developed the site layout, the interactive gifting flow and the card-scroll transitions between pages.",
  },
];

export const githubProfile = "https://github.com/hotaru-py";

export const projects = [
  {
    name: "My Personal Website (this one!)",
    description:
      "My personal website, with a choice of a desktop/phone-like interface or a markdown-style page, and agent-crawlable text",
    link: "https://github.com/hotaru-py/hotaru-py.github.io",
  },
  {
    name: "p5.rain",
    description:
      "NASA's IMERG global precipitation data as a live, interactive pixel field for p5.js.",
    link: "https://github.com/hotaru-py/p5-rain",
    // Opens with a live demo in the Work window, and gets its own desktop icon
    demo: "p5rain",
  },
  {
    name: "LookAtDisPatch",
    description:
      "Agentic operations optimization for last-mile delivery, with a versatile command-center dashboard. Entry for Google DevFest '26 Agent Wars",
    link: "https://github.com/hotaru-py/LookAtDisPatch",
  },
  {
    name: "Eunoia",
    description:
      "AI-powered DIY learning platform that turns objects at hand into hands-on projects using computer vision & RAG",
    link: "https://github.com/Try3D/Eunoia",
  },
  {
    name: "ClothSense",
    description:
      "Interactive 3D virtual clothing try-on from a single 2D image, as a semester 7 course project for Modern 3D Vision Techniques",
    link: "https://github.com/hotaru-py/ClothSense",
  },
  {
    name: "Minimalist ROG Grub Theme",
    description:
      "Minimalist theme for the GRUB bootloader, built around ASUS ROG branding",
    link: "https://github.com/hotaru-py/rog-grub",
    // Shown until (or if) the live count can't be fetched
    stars: { repo: "hotaru-py/rog-grub", fallback: 27 },
  },
  {
    name: "Starboard",
    description:
      "A fast, versatile and highly extensible platform for optimal ship routing. Smart India Hackathon (SIH) 2024 nominee from Shiv Nadar University Chennai",
    link: "https://github.com/hotaru-hspr/Starboard",
  },
  {
    name: "SNUGPA",
    description:
      "CGPA/SGPA calculator with saved records for Shiv Nadar University Chennai, used by 750+ unique users",
    link: "https://github.com/EditaCTF/SNUC_Grade_Calculator",
  },
  {
    name: "CacheSim",
    description:
      "Animated cache simulation built with Svelte & FastAPI, as a semester 2 course project for Computer Organization and Architecture (COA)",
    link: "https://github.com/hotaru-py/CacheSim",
  },
];

// `id` picks the icon in the Browser window (or `icon`, when two share one)
export const bookmarks = [
  // {
  //   id: "youtube",
  //   name: "YouTube Channel (this stuff)",
  //   url: "https://www.youtube.com/@hotarumakes",
  // },
  // {
  //   id: "instagram",
  //   name: "Instagram",
  //   url: "https://www.instagram.com/hotarumakes",
  // },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/in/prajeshraam",
  },
  { id: "github", name: "GitHub", url: "https://github.com/hotaru-py" },
  // Delisted for now
  // {
  //   id: "behance",
  //   name: "Behance",
  //   url: "https://www.behance.net/prajeshraam",
  // },
  { id: "email", name: "Email", url: "mailto:hotarumakes@gmail.com" },
  {
    id: "youtube-random",
    icon: "youtube",
    name: "YouTube Channel (random stuff)",
    url: "https://www.youtube.com/@hotaruuuh",
  },
];

// Pixabay's attribution links (the utm_content number is one of that creator's sounds)
const PIXABAY_ATTRIBUTION =
  "?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=";

export const credits = {
  heading: "What made this website?",
  inspiration: {
    lead: "Website inspired by",
    name: "shar",
    aside: "w person",
    // `id` picks the icon on the pill
    links: [
      { id: "website", label: "sharyap.com", url: "https://sharyap.com" },
      {
        id: "youtube",
        label: "YouTube",
        url: "https://www.youtube.com/c/sharyap",
      },
    ],
  },
  avatar: {
    character: "Firefly",
    source: "Honkai: Star Rail",
    note: "Character and artwork © HoYoverse. Non-commercial usage.",
  },
  // The site's typeface, an open font whose licence asks to be shown with it
  typeface: {
    name: "Ioskeley Mono",
    by: "Ahmed Hatem, built on Iosevka by Renzhi Li",
    url: "https://github.com/ahatem/IoskeleyMono",
    site: "github.com/ahatem/IoskeleyMono",
    license: "SIL Open Font License 1.1",
  },
  // NASA's terms for the p5.rain data (window and wallpaper), as the p5.rain README
  // asks: credit "NASA GPM IMERG via GIBS", GIBS's acknowledgement, no implied endorsement
  rainData: {
    short: "Rain data: NASA GPM IMERG via GIBS",
    sources: [
      { text: "NASA GPM IMERG", url: "https://gpm.nasa.gov/data/imerg" },
      { text: "NASA GIBS", url: "https://www.earthdata.nasa.gov/gibs" },
    ],
    acknowledgement:
      "We acknowledge the use of imagery provided by services from NASA's Global Imagery Browse Services (GIBS), part of NASA's Earth Science Data and Information System (ESDIS).",
    disclaimer:
      "This website and p5.rain are not affiliated with or endorsed by NASA.",
  },
  // Every sound on the site comes from Pixabay; each creator is listed once
  sounds: {
    source: {
      text: "Pixabay",
      url: "https://pixabay.com/sound-effects/" + PIXABAY_ATTRIBUTION + "44936",
    },
    creators: [
      {
        text: "freesound_community",
        url:
          "https://pixabay.com/users/freesound_community-46691455/" +
          PIXABAY_ATTRIBUTION +
          "44936",
      },
      {
        text: "JustSomeSounds",
        url:
          "https://pixabay.com/users/justsomesounds-53130806/" +
          PIXABAY_ATTRIBUTION +
          "432501",
      },
      {
        text: "u_u4pf5h7zip",
        url:
          "https://pixabay.com/users/u_u4pf5h7zip-50459877/" +
          PIXABAY_ATTRIBUTION +
          "345983",
      },
    ],
  },
};

/**
 * Splits text on **double asterisks** into plain and emphasised parts.
 * @param {string} text
 * @returns {{ text: string, strong: boolean }[]}
 */
export function emphasis(text) {
  return text
    .split("**")
    .map((part, i) => ({ text: part, strong: i % 2 === 1 }))
    .filter((part) => part.text);
}

/** "School - Board", or just the school when there's no board */
export function schoolName(entry) {
  return entry.board ? `${entry.school} - ${entry.board}` : entry.school;
}

/** Text with the ** markers removed, for plain-text outputs */
export function plain(text) {
  return text.replaceAll("**", "");
}

/** "N stars on GitHub" / "1 star on GitHub" */
export function starLabel(count) {
  return `${count} ${count === 1 ? "star" : "stars"} on GitHub`;
}
