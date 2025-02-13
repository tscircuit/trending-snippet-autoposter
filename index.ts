import { TwitterPoster } from '@/platforms/twitter';
import { RedditPoster } from '@/platforms/reddit';
import { DiscordPoster } from '@/platforms/discord';
import { PostManager } from '@/platforms/manager';
import { fetchTrendingSnippets } from '@/snippets/fetch-trending-snippets';
import { loadPostedSnippets, savePostedSnippet } from '@/snippets/track-posted-snippets';
import debug from 'debug';

export default async function main() {
  console.clear()
    debug('[INDEX] Starting main function.\n');

    const snippets = await fetchTrendingSnippets();
    const postedSnippets = loadPostedSnippets();

    const snippetToPost = snippets.find(
      (snippet: Snippet) => !postedSnippets.includes(snippet.snippet_id)
    );

    if (!snippetToPost) {
      console.info('[INDEX] No new snippets to post.');
      return;
    }

    const twitterPoster = new TwitterPoster();
    const redditPoster = new RedditPoster();
    const discordPoster = new DiscordPoster();

    const postManager = new PostManager([twitterPoster, redditPoster, discordPoster]);

    const result = await postManager.postSnippet(snippetToPost);

    if(result.successes) {
        savePostedSnippet(snippetToPost.snippet_id);
    }

    console.log('\n[INDEX] Main function completed successfully.')
}

if (import.meta.main) {
  main().catch((error) => console.error('[INDEX] Main function failed:', error));
}