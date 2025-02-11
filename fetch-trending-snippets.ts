import { fetch } from 'bun';

interface Snippet {
  snippet_id: string;
  unscoped_name: string;
  name: string;
  owner_name: string;
  code: string;
  created_at: string;
  updated_at: string;
  snippet_type: string;
  description: string;
  star_count: number;
}

export async function fetchTrendingSnippets(): Promise<Snippet[]> {
  const response = await fetch('https://registry-api.tscircuit.com/snippets/list_trending');
  if (!response.ok) throw new Error('Failed to fetch trending snippets');
  const data = await response.json();
  return data.snippets.filter((snippet: any) => snippet.star_count >= 2) satisfies Snippet[];
}