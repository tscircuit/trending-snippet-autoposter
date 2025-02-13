import { TwitterApi } from 'twitter-api-v2';
import { SnippetFormatter } from '@/utils/snippet-formatter';
import debug from 'debug';

export class TwitterPoster implements PlatformPoster {
  private client: TwitterApi | null = null;

  constructor() {
    const twitterToken = process.env.TWITTER_TOKEN;
    if (!twitterToken) {
      console.error('[TWITTER-POSTER] Missing Twitter token. Skipping Twitter posting.');
      return;
    }
    this.client = new TwitterApi(twitterToken);
  }

  async post(snippet: Snippet) {
    if (!this.client) {
      debug('[TWITTER-POSTER] Twitter client not initialized. Skipping post.');
      return;
    }

    try {
      const message = SnippetFormatter.formatForTwitter(snippet);
      await this.client.v2.tweet(message);
      debug(`[TWITTER-POSTER] Successfully posted snippet to Twitter: ${snippet.name}`);
      return true
    } catch (error) {
      console.error(`[TWITTER-POSTER] Failed to post snippet to Twitter:`, error);
    }
  }
}