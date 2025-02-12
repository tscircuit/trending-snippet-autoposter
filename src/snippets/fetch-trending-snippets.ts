import { fetch } from 'bun';

export async function fetchTrendingSnippets(): Promise<Snippet[]> {
  try {
    console.log('[FETCH-TRENDING-SNIPPETS] Fetching trending snippets...');
    const response = await fetch('https://registry-api.tscircuit.com/snippets/list_trending');
    if (!response.ok) {
      throw new Error(`Failed to fetch trending snippets: ${response.statusText}`);
    }
    const content = await response.json();
    const snippets = content.snippets.filter((snippet: any) => snippet.star_count >= 2) satisfies Snippet[];
    console.log(`[FETCH-TRENDING-SNIPPETS] Successfully fetched ${snippets.length} trending snippets.`);
    return snippets;
  } catch (error) {
    console.error('[FETCH-TRENDING-SNIPPETS] Error fetching trending snippets:', error);
    return [];
  }
}