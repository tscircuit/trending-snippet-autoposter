import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

const TRACKED_FILE = path.join(__dirname, './previous-trending-snippets.json');

export function loadPostedSnippets(): string[] {
  try {
    const data = readFileSync(TRACKED_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function savePostedSnippet(snippetId: string) {
  const postedSnippets = loadPostedSnippets();
  postedSnippets.push(snippetId);
  writeFileSync(TRACKED_FILE, JSON.stringify(postedSnippets, null, 2));
}