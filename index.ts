import { TwitterPoster } from '@/platforms/twitter';
import { RedditPoster } from '@/platforms/reddit';
import { DiscordPoster } from '@/platforms/discord';
import { PostManager } from '@/platforms/manager';
import { fetchTrendingSnippets } from '@/snippets/fetch-trending-snippets';
import { loadPostedSnippets, savePostedSnippet } from '@/snippets/track-posted-snippets';

export default async function main() {
    console.warn('[INDEX] Starting main function.');

    const snippets = await fetchTrendingSnippets();
    const postedSnippets = loadPostedSnippets();

    const snippetToPost = snippets.find(
      (snippet: Snippet) => !postedSnippets.includes(snippet.snippet_id)
    );

    if (!snippetToPost) {
      console.log('[INDEX] No new snippets to post.');
      return;
    }

    const twitterPoster = new TwitterPoster();
    const redditPoster = new RedditPoster();
    const discordPoster = new DiscordPoster();

    const postManager = new PostManager([twitterPoster, redditPoster, discordPoster]);

    await postManager.postSnippet(snippetToPost);

    savePostedSnippet(snippetToPost.snippet_id);

    console.log('[INDEX] Main function completed successfully.');

}

if (import.meta.main) {
  main().catch((error) => console.error('[INDEX] Main function failed:', error));
}