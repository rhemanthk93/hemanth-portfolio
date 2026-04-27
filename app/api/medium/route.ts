import { getLatestArticles } from "@/lib/medium";

export const revalidate = 3600;

export async function GET() {
  const articles = await getLatestArticles(3);
  return Response.json({ articles });
}
