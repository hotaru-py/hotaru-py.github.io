// Everything the site says, in one place. The desktop windows, Simple Mode, the static
// copy baked into index.html for crawlers, and /llms.txt are all built from this file,
// so edit content here. Plain data only (no asset imports): vite.config.js reads it too.
//
// Text may use **double asterisks** for emphasis; see emphasis() below.

export const site = {
  url: "https://hotaru-py.github.io/",
  name: "Prajesh Raam",
  handle: "hotaru",
  title: "Prajesh Raam, full-stack developer & designer",
  description:
    "Portfolio of Prajesh Raam (hotaru): full-stack developer, designer and artist. Live websites, personal projects, skills and links, presented as a playful desktop or a simple text page.",
  jobTitle: "Full-stack developer & designer",
};

export const about = {
  greeting: "Hello, I'm Prajesh (^_^)/",
  pronouns: "he/him",
  intro: [
    "I'm an engineer by day, designer by night, artist throughout. Currently an undergrad engineering student and a full-stack developer.",
    "Working on a few different things, including but not limited to:",
  ],
  interests: [
    "**software development** across platforms and stacks",
    "designing **visually appealing, usable, and accessible** experiences",
    "**graphic & UI/UX design**",
    "**product and interaction design** in the long run",
  ],
  outro:
    "If I’m not doing the above, I’m probably at the piano, doodling at my desk, on the tennis court, watching the evolution of the Intel Inside jingle for the gazillionth time, bingeing anime or TV, watching rich people race expensive cars in circles, listening to my curated Mr. Worldwide playlist with Hatsune Miku sitting between Olivia Rodrigo and Kanye West, or just kicking back and taking a nap.",
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
      lines: [
        "Class XII · Computer Science & Mathematics (2023)",
        "Class X (2021)",
      ],
    },
  ],
};

export const experience = [
  {
    role: "Software Development Engineering Intern",
    company: "Miniture",
    url: "https://miniture.in",
    period: "March 2025 - February 2026",
  },
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
  },
  {
    id: "invente",
    name: "SSN-SNUC INVENTE '26",
    url: "https://invente-2026.vercel.app/",
    domain: "invente-2026.vercel.app",
  },
  {
    id: "instincts",
    name: "SSN-SNUC INSTINCTS '26",
    url: "https://www.ssnsnucinstincts.com/",
    domain: "ssnsnucinstincts.com",
  },
  {
    id: "tcc",
    name: "The Curation Company",
    url: "https://www.thecurationcompany.in/",
    domain: "thecurationcompany.in",
  },
];

export const githubProfile = "https://github.com/hotaru-py";

export const projects = [
  {
    name: "My Personal Website (this one!)",
    description:
      "My personal website, with a desktop/mobile-like interface and a simpler-to-read page",
    link: "https://github.com/hotaru-hspr/hotaru-hspr.github.io",
  },
  {
    name: "Eunoia",
    description:
      "AI-powered DIY learning platform that turns objects at hand into hands-on projects using computer vision & RAG",
    link: "https://github.com/Try3D/Eunoia",
  },
  {
    name: "Minimalist ROG Grub Theme",
    description: "Minimalist theme for the Grub Bootloader",
    link: "https://github.com/hotaru-py/rog-grub",
    // Shown until (or if) the live count can't be fetched
    stars: { repo: "hotaru-py/rog-grub", fallback: 27 },
  },
  {
    name: "Starboard",
    description:
      "A fast, versatile, extensible and highly flexible platform for optimal ship routing",
    link: "https://github.com/hotaru-hspr/Starboard",
  },
  {
    name: "SNUGPA",
    description: "CGPA/SGPA Calculator for SNU Chennai",
    link: "https://github.com/EditaCTF/SNUC_Grade_Calculator",
  },
  {
    name: "CacheSim",
    description: "Animated Cache Simulation using Svelte & FastAPI",
    link: "https://github.com/hotaru-py/CacheSim",
  },
];

// `id` picks the icon in the Browser window
export const bookmarks = [
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/in/prajesh-raam",
  },
  { id: "email", name: "Email", url: "mailto:prajeshraam@gmail.com" },
  { id: "github", name: "GitHub", url: "https://github.com/hotaru-py" },
  {
    id: "behance",
    name: "Behance",
    url: "https://www.behance.net/prajeshraam",
  },
  {
    id: "youtube",
    name: "YouTube (random stuff)",
    url: "https://www.youtube.com/@hotaruuuh",
  },
];

// Attribution links exactly as Pixabay asks for them
const PIXABAY_XYLOPHONE =
  "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=45818";
const PIXABAY_CLICKS =
  "https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=432501";

export const credits = {
  heading: "What made this website?",
  inspiration: {
    lead: "Website inspired by",
    name: "shar",
    aside: "wholesome content, do watch",
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
  // Each line mixes plain text with { text, url } links
  sounds: [
    [
      "Xylophone sounds by",
      {
        text: "freesound_community",
        url: "https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=45818",
      },
      "from",
      { text: "Pixabay", url: PIXABAY_XYLOPHONE },
    ],
    [
      "Mouse click sounds by",
      {
        text: "JustSomeSounds",
        url: "https://pixabay.com/users/justsomesounds-53130806/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=432501",
      },
      "and",
      {
        text: "u_u4pf5h7zip",
        url: "https://pixabay.com/users/u_u4pf5h7zip-50459877/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=345983",
      },
      "from",
      { text: "Pixabay", url: PIXABAY_CLICKS },
    ],
  ],
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
