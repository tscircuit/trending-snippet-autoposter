import { TwitterPoster } from '@/platforms/twitter';
import { RedditPoster } from '@/platforms/reddit';
import { DiscordPoster } from '@/platforms/discord';
import { PostManager } from '@/platforms/manager';
import { fetchTrendingSnippets } from '@/fetch-trending-snippets';
import { loadPostedSnippets, savePostedSnippet } from '@/track-posted-snippets';

async function main() {
  const snippets = await fetchTrendingSnippets();
  const postedSnippets = loadPostedSnippets();

  const snippetToPost = snippets.find(
    (snippet) => !postedSnippets.includes(snippet.snippet_id)
  );

  if (!snippetToPost) {
    console.log('No new snippets to post.');
    return;
  }

  // Initialize platform posters
  const twitterPoster = new TwitterPoster(process.env.TWITTER_API_KEY!);
  const redditPoster = new RedditPoster();
  const discordPoster = new DiscordPoster(process.env.DISCORD_WEBHOOK_URL!);

  // Initialize PostManager
  const postManager = new PostManager([twitterPoster, redditPoster, discordPoster]);

  // Post the snippet
  await postManager.postSnippet(snippetToPost);

  // Track the posted snippet
  savePostedSnippet(snippetToPost.snippet_id);
}

main().catch(console.error);