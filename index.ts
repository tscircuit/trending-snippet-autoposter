import { fetchTrendingSnippets } from "./fetch-trending-snippets";
import { postSnippet } from "./post-snippet";
import { loadPostedSnippets, savePostedSnippet } from "./track-posted-snippets";

async function main() {
  const snippets = await fetchTrendingSnippets();
  const postedSnippets = loadPostedSnippets();

  const snippetToPost = snippets.find(
    (snippet) => !postedSnippets.includes(snippet.snippet_id)
  );

  if (snippetToPost) {
    await postSnippet(snippetToPost);
    savePostedSnippet(snippetToPost.snippet_id);
  } else {
    console.log('No new snippets to post.');
  }
}

main().catch(console.error);