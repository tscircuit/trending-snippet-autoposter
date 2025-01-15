import axios from "axios";
import fs from "fs/promises";
import path from "path";

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

interface PreviousSnippets {
  posted_snippets: string[]; // Array of snippet_ids
}

const TRENDING_API = process.env.TRENDING_API_URL || "https://registry-api.tscircuit.com/snippets/list_trending";
const PREVIOUS_SNIPPETS_FILE = "previous-trending-snippets.json";
const MIN_STARS_REQUIRED = 2;

async function loadPreviousSnippets(): Promise<PreviousSnippets> {
  try {
    const content = await fs.readFile(PREVIOUS_SNIPPETS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // If file doesn't exist, return empty array
    return { posted_snippets: [] };
  }
}

async function savePreviousSnippets(snippets: PreviousSnippets): Promise<void> {
  await fs.writeFile(
    PREVIOUS_SNIPPETS_FILE,
    JSON.stringify(snippets, null, 2)
  );
}

async function postToSocialMedia(snippet: Snippet): Promise<void> {
  const postData = {
    sr: "tscircuit",     // subreddit name (required)
    kind: "self",        // post type (required)
    title: `${snippet.name}: ${snippet.description}`,
    // Provide simple text and let server handle formatting
    text: snippet.description,
    code: snippet.code,
    description: snippet.description,
    snippet_type: snippet.snippet_type,
    star_count: snippet.star_count,
    owner_name: snippet.owner_name,
    created_at: snippet.created_at,
    updated_at: snippet.updated_at,
    url: `https://registry.tscircuit.com/snippets/${snippet.snippet_id}`
  };

  // Post to Reddit (using fake-reddit in tests)
  const baseUrl = process.env.FAKE_REDDIT_URL || "http://localhost:3000";
  await axios.post(`${baseUrl}/api/submit`, postData, {
    headers: {
      Authorization: "Bearer test-token"
    }
  });
}

async function main() {
  try {
    // Fetch trending snippets
    const response = await axios.get<{ snippets: Snippet[] }>(TRENDING_API);
    const { snippets } = response.data;

    // Load previously posted snippets
    const previousSnippets = await loadPreviousSnippets();

    // Find the most starred unposted snippet
    const eligibleSnippets = snippets
      .filter((s) => s.star_count >= MIN_STARS_REQUIRED)
      .filter((s) => !previousSnippets.posted_snippets.includes(s.snippet_id))
      .sort((a, b) => b.star_count - a.star_count);

    if (eligibleSnippets.length === 0) {
      console.log("No new eligible snippets to post");
      return;
    }

    const snippetToPost = eligibleSnippets[0];

    // Post to social media
    await postToSocialMedia(snippetToPost);

    // Update tracking file
    previousSnippets.posted_snippets.push(snippetToPost.snippet_id);
    await savePreviousSnippets(previousSnippets);

    console.log(`Successfully posted snippet: ${snippetToPost.name}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Export main function for testing
export default main;

// Run the script if not being imported for tests
if (import.meta.main) {
  main();
}