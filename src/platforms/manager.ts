export class PostManager {
  private posters: PlatformPoster[];

  constructor(posters: PlatformPoster[]) {
    this.posters = posters;
  }

  async postSnippet(snippet: any): Promise<void> {
    for (const poster of this.posters) {
      try {
        await poster.post(snippet);
        console.log(`Posted snippet to ${poster.constructor.name}`);
      } catch (error) {
        console.error(`Failed to post snippet to ${poster.constructor.name}:`, error);
      }
    }
  }
}