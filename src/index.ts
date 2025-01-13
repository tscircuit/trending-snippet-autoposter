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

const TRENDING_API = "https://registry-api.tscircuit.com/snippets/list_trending";
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
    title: `${snippet.name}: ${snippet.description}`,
    body: `Check out this trending tscircuit snippet!

Type: ${snippet.snippet_type}
Stars: ${snippet.star_count}
Created by: ${snippet.owner_name}

Code:
\`\`\`typescript
${snippet.code}
\`\`\``,
    url: `https://registry.tscircuit.com/snippets/${snippet.snippet_id}`
  };

  // Post to Reddit (using fake-reddit in tests)
  const baseUrl = process.env.FAKE_REDDIT_URL || "http://localhost:3000";
  await axios.post(`${baseUrl}/posts/submit`, postData);
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
