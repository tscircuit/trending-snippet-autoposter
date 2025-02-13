import snoowrap from 'snoowrap';
import { SnippetFormatter } from '@/utils/snippet-formatter';
import debug from 'debug';

export class RedditPoster implements PlatformPoster {
  private client: snoowrap | null = null;

  constructor() {
    const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT;
    const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
    const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
    const REDDIT_USERNAME = process.env.REDDIT_USERNAME;
    const REDDIT_PASSWORD = process.env.REDDIT_PASSWORD;

    if (!REDDIT_USER_AGENT || !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
      console.error('[REDDIT-POSTER] Missing Reddit API credentials. Skipping Reddit posting.');
      return;
    }

    this.client = new snoowrap({
      userAgent: REDDIT_USER_AGENT,
      clientId: REDDIT_CLIENT_ID,
      clientSecret: REDDIT_CLIENT_SECRET,
      username: REDDIT_USERNAME,
      password: REDDIT_PASSWORD,
    });
  }

  async post(snippet: Snippet) {
    if (!this.client) {
      debug('[REDDIT-POSTER] Reddit client not initialized. Skipping post.');
      return;
    }

    try {
      const title = `New Trending Snippet: ${snippet.name}`;
      const content = SnippetFormatter.formatForReddit(snippet);

      this.client.submitSelfpost({
        title: title,
        text: content,
        subredditName: process.env.REDDIT_SUBREDDIT
      });

      debug(`[REDDIT-POSTER] Successfully posted snippet to Reddit: ${title}`);
      return true
    } catch (error) {
      console.error(`[REDDIT-POSTER] Failed to post snippet to Reddit:`, error);
    }
  }
}