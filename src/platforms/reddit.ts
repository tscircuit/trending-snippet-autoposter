// import { postToReddit } from '@tscircuit/fake-reddit';

export class RedditPoster implements PlatformPoster {
  async post(snippet: Snippet) {
    throw new Error('Not implemented')
    return false
    // await postToReddit({ title, content });
  }
}