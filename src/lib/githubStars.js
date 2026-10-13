// Live GitHub star counts. The public API allows 60 requests an hour per visitor, so
// results are cached in the browser for an hour; callers keep a fallback for failures.

const CACHE_PREFIX = "gh-stars:";
const CACHE_MS = 60 * 60 * 1000;

/**
 * @param {string} repo "owner/name"
 * @returns {Promise<number | null>} The star count, or null if it couldn't be fetched
 */
export async function fetchStars(repo) {
  const key = CACHE_PREFIX + repo;
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? "null");
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.stars;
  } catch {
    // No storage or a bad entry: just ask GitHub
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const { stargazers_count: stars } = await res.json();
    if (!Number.isInteger(stars)) return null;
    try {
      localStorage.setItem(key, JSON.stringify({ stars, at: Date.now() }));
    } catch {
      // Storage unavailable; it'll simply be fetched again next time
    }
    return stars;
  } catch {
    return null;
  }
}
