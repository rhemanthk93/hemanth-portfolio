export type ContributionCell = { date: string; level: 0 | 1 | 2 | 3 | 4 };

export type GitHubData = {
  username: string | null;
  totalContributionsLastYear: number | null;
  cells: ContributionCell[]; // last 14 weeks (98 cells)
  fallback: boolean; // true if scrape failed and we returned empty
};

const REVALIDATE_SECONDS = 21600; // 6 hours

const CELL_RE = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="([0-4])"/g;
const ALT_CELL_RE = /data-level="([0-4])"[^>]*data-date="(\d{4}-\d{2}-\d{2})"/g;
const TOTAL_RE = /([\d,]+)\s+contribution/i;

function parseCells(html: string): ContributionCell[] {
  const out: ContributionCell[] = [];
  CELL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CELL_RE.exec(html)) !== null) {
    out.push({
      date: m[1],
      level: Number(m[2]) as 0 | 1 | 2 | 3 | 4,
    });
  }
  if (out.length === 0) {
    // attribute order varies between renderings; try the alternate order
    ALT_CELL_RE.lastIndex = 0;
    while ((m = ALT_CELL_RE.exec(html)) !== null) {
      out.push({
        date: m[2],
        level: Number(m[1]) as 0 | 1 | 2 | 3 | 4,
      });
    }
  }
  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

function parseTotal(html: string): number | null {
  const m = TOTAL_RE.exec(html);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function getGitHubData(weeks = 14): Promise<GitHubData> {
  const username = process.env.GITHUB_USERNAME?.trim() || null;
  if (!username) {
    return {
      username: null,
      totalContributionsLastYear: null,
      cells: [],
      fallback: true,
    };
  }

  try {
    const res = await fetch(
      `https://github.com/users/${username}/contributions`,
      {
        headers: {
          "User-Agent": "askhemanth-portfolio/0.1",
          Accept: "text/html",
        },
        next: { revalidate: REVALIDATE_SECONDS },
      }
    );
    if (!res.ok) {
      console.warn(`[github] contributions HTTP ${res.status}`);
      return {
        username,
        totalContributionsLastYear: null,
        cells: [],
        fallback: true,
      };
    }
    const html = await res.text();
    const cells = parseCells(html);
    const sliced = cells.slice(-weeks * 7);
    const total = parseTotal(html);
    return {
      username,
      totalContributionsLastYear: total,
      cells: sliced,
      fallback: sliced.length === 0,
    };
  } catch (err) {
    console.warn("[github] fetch failed:", err);
    return {
      username,
      totalContributionsLastYear: null,
      cells: [],
      fallback: true,
    };
  }
}
