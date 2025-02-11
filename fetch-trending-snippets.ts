import { fetch } from 'bun';

interface Snippet {
    snippet_id: 'todo';
}

export async function fetchTrendingSnippets(): Promise<Snippet[]> {
  const response = await fetch('https://registry-api.tscircuit.com/snippets/list_trending');
  if (!response.ok) throw new Error('Failed to fetch trending snippets');
  const data = await response.json();
  return data.snippets.filter((snippet: any) => snippet.star_count >= 2) satisfies Snippet[];
}