import { fetch } from 'bun';
import consola from 'consola';

export async function fetchTrendingSnippets(): Promise<Snippet[]> {
  try {
    console.log('[FETCH-TRENDING-SNIPPETS] Fetching trending snippets...');
    const response = await fetch('https://registry-api.tscircuit.com/snippets/list_trending');
    if (!response.ok) {
      throw new Error(`Failed to fetch trending snippets: ${response.statusText}`);
    }
    const data = await response.json();
    const snippets = data.snippets.filter((snippet: any) => snippet.star_count >= 2) satisfies Snippet[];
    console.log(`[] `);
    consola.success({
      message: `Successfully fetched ${snippets.length} trending snippets.`,
      badge: 'FETCH-TRENDING-SNIPPETS'
    })
    return snippets;
  } catch (error) {
    consola.error({
      message: `Error fetching trending snippets: ${error}`,
      badge: 'FETCH-TRENDING-SNIPPETS'
    })
    return [];
  }
}