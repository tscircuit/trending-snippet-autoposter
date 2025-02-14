import debug from "debug";
import { writeFileSync, readFileSync } from "fs";
import path from "path";

const TRACKED_FILE = path.join(
  process.cwd(),
  "previous-trending-snippets.json",
);

function loadPostedSnippets(): string[] {
  debug("[TRACK-POSTED-SNIPPETS] Loading posted snippets...");
  try {
    const content = readFileSync(TRACKED_FILE, "utf8");
    const postedSnippets = JSON.parse(content);
    debug(
      `[TRACK-POSTED-SNIPPETS] Successfully loaded ${postedSnippets.length} posted snippets.`,
    );
    return postedSnippets;
  } catch (error) {
    console.error(
      "[TRACK-POSTED-SNIPPETS] Error loading previous snippets:",
      error,
    );
    return [];
  }
}

function savePostedSnippet(snippetId: string): void {
  debug(`[TRACK-POSTED-SNIPPETS] Saving snippet ID: ${snippetId}`);
  const postedSnippets = loadPostedSnippets();
  if (!Array.isArray(postedSnippets)) {
    console.error(
      "[TRACK-POSTED-SNIPPETS] Invalid data format in posted snippets file.",
    );
    return;
  }

  const updatedSnippets = [...new Set([...postedSnippets, snippetId])];
  try {
    writeFileSync(TRACKED_FILE, JSON.stringify(updatedSnippets, null, 2));
    debug(
      `[TRACK-POSTED-SNIPPETS] Successfully saved snippet ID: ${snippetId}`,
    );
  } catch (error) {
    console.error(
      `[TRACK-POSTED-SNIPPETS] Error saving posted snippet:`,
      error,
    );
  }
}

export { loadPostedSnippets, savePostedSnippet };
