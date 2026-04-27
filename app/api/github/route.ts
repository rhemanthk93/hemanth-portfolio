import { getGitHubData } from "@/lib/github";

export const revalidate = 21600;

export async function GET() {
  const data = await getGitHubData();
  return Response.json(data);
}
