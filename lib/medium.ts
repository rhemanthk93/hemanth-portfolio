export type MediumArticle = {
  title: string;
  url: string;
  excerpt: string;
  pubDate: string;
};

type Rss2JsonItem = {
  title?: string;
  pubDate?: string;
  link?: string;
  description?: string;
  content?: string;
};

type Rss2JsonResponse = {
  status?: string;
  items?: Rss2JsonItem[];
};

const REVALIDATE_SECONDS = 3600;

function stripHtml(s: string): string {
  return s
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFrom(item: Rss2JsonItem, max = 200): string {
  const raw = item.description ?? item.content ?? "";
  const txt = stripHtml(raw);
  if (txt.length <= max) return txt;
  return txt.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

export async function getLatestArticles(limit = 3): Promise<MediumArticle[]> {
  const username = process.env.MEDIUM_USERNAME?.trim();
  if (!username) return [];

  const feed = `https://medium.com/feed/@${username}`;
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
    feed
  )}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as Rss2JsonResponse;
    if (json.status !== "ok" || !Array.isArray(json.items)) return [];
    return json.items
      .filter((it) => it.title && it.link)
      .slice(0, limit)
      .map<MediumArticle>((it) => ({
        title: it.title!,
        url: it.link!,
        excerpt: excerptFrom(it),
        pubDate: it.pubDate ?? "",
      }));
  } catch (err) {
    console.warn("[medium] fetch failed:", err);
    return [];
  }
}
