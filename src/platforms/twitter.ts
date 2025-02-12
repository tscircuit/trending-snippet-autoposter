import { SnippetFormatter } from '@/utils/snippet-formatter';
import { TwitterApi } from 'twitter-api-v2';

export class TwitterPoster implements PlatformPoster {
  private client: TwitterApi;

  constructor(apiKey: string = Bun.env.TWITTER_TOKEN) {
    this.client = new TwitterApi(apiKey);
  }

  async post(snippet: Snippet): Promise<void> {
    const message = SnippetFormatter.formatForTwitter(snippet);
    await this.client.v2.tweet(message);
  }
}