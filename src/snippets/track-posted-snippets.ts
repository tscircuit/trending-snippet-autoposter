import debug from 'debug';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

const TRACKED_FILE = path.join(process.cwd(), 'previous-trending-snippets.json');

export function loadPostedSnippets(): string[] {
  try {
    debug('[TRACK-POSTED-SNIPPETS] Loading posted snippets...');
    const content = readFileSync(TRACKED_FILE, 'utf8');
    const postedSnippets = JSON.parse(content);
   debug(`[TRACK-POSTED-SNIPPETS] Successfully loaded ${postedSnippets.length} posted snippets.`);
    return postedSnippets;
  } catch (error) {
    console.error('[TRACK-POSTED-SNIPPETS] Error loading previous snippets:');
    return [];
  }
}

export function savePostedSnippet(snippetId: string): void {
  try {
   debug(`[TRACK-POSTED-SNIPPETS] Saving snippet ID: ${snippetId}`);
    const postedSnippets = loadPostedSnippets();
    postedSnippets.push(snippetId);
    writeFileSync(TRACKED_FILE, JSON.stringify([...new Set(postedSnippets)], null, 2));
   debug(`[TRACK-POSTED-SNIPPETS] Successfully saved snippet ID: ${snippetId}`);
  } catch (error) {
    console.error(`[TRACK-POSTED-SNIPPETS] Error saving posted snippet:`, error);
  }
}