// Everything the site says, in one place. The desktop windows, Simple Mode, the static
// copy baked into index.html for crawlers, and /llms.txt are all built from this file,
// so edit content here. Plain data only (no asset imports): vite.config.js reads it too.
//
// Text may use **double asterisks** for emphasis; see emphasis() below.

export const site = {
  url: "https://hotaru-py.github.io/",
  name: "hotaru",
  handle: "hotarumakes",
  title: "hotaru | i make stuff that looks good to me",
  description:
    "Portfolio of hotaru: full-stack developer, designer and artist. Live websites, personal projects, skills and links, presented as a playful desktop or a simple text page.",
  jobTitle: "Full-stack developer & designer",
};

export const about = {
  greeting: "Hello, I'm hotaru (^_^)/",
  // Shown under the greeting
  realName: "Prajesh Raam",
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
      lines: ["Computer Science & Mathematics (2023)"],
    },
  ],
};

// Most recent first; `url` is optional (freelancing has no company page)
export const experience = [
  {
    role: "Web Development, UI/UX & Graphic Design",
    company: "Freelance",
    period: "2021 - Present",
  },
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
    link: "https://github.com/hotaru-hspr/hotaru-hspr.github.io",
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
  {
    id: "youtube",
    name: "YouTube Channel (this stuff)",
    url: "https://www.youtube.com/@hotarumakes",
  },
  {
    id: "instagram",
    name: "Instagram",
    url: "https://www.instagram.com/hotarumakes",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    url: "https://linkedin.com/in/prajeshraam",
  },
  { id: "github", name: "GitHub", url: "https://github.com/hotaru-py" },
  {
    id: "behance",
    name: "Behance",
    url: "https://www.behance.net/prajeshraam",
  },
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
