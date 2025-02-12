import consola from 'consola';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

const TRACKED_FILE = path.join(process.cwd(), 'previous-trending-snippets.json');

export function loadPostedSnippets(): string[] {
  try {
    consola.info({
      message: `Loading posted snippets`,
      badge: 'TRACK-POSTED-SNIPPETS'
    })
    const data = readFileSync(TRACKED_FILE, 'utf8');
    const postedSnippets = JSON.parse(data);
    consola.success({
      message: `Successfully loaded ${postedSnippets.length} posted snippets.`,
      badge: 'TRACK-POSTED-SNIPPETS'
    })
    return postedSnippets;
  } catch (error) {
    consola.error({
      message: `Error loading posted snippets: ${error}`,
      badge: 'TRACK-POSTED-SNIPPETS'
    })
    return [];
  }
}

export function savePostedSnippet(snippetId: string): void {
  try {
    console.log(`[TRACK-POSTED-SNIPPETS] Saving snippet ID: ${snippetId}`);
    const postedSnippets = loadPostedSnippets();
    postedSnippets.push(snippetId);
    writeFileSync(TRACKED_FILE, JSON.stringify([...new Set(postedSnippets)], null, 2));
    console.log(`[TRACK-POSTED-SNIPPETS] Successfully saved snippet ID: ${snippetId}`);
  } catch (error) {
    console.error(`[TRACK-POSTED-SNIPPETS] Error saving posted snippet:`, error);
  }
}