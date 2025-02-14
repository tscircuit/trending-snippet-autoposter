import { fetch } from "bun";
import debug from "debug";

export async function fetchTrendingSnippets(): Promise<Snippet[]> {
  debug("Fetching trending snippets...");
  const response = await fetch(
    "https://registry-api.tscircuit.com/snippets/list_trending",
  );
  if (!response.ok) {
    console.error(
      `[FETCH-TRENDING-SNIPPETS] Error fetching trending snippets: ${response.statusText}`,
    );
    return [];
  }
  const content = await response.json();
  const snippets = content.snippets.filter(
    (snippet: any) => snippet.star_count >= 2,
  ) satisfies Snippet[];
  debug(`Successfully fetched ${snippets.length} trending snippets.`);
  return snippets;
}
