export class PostManager {
  private posters: PlatformPoster[];

  constructor(posters: PlatformPoster[]) {
    this.posters = posters;
    console.log('[POST-MANAGER] Initialized with posters:', posters.map(poster => poster.constructor.name).join(', '));
  }

  async postSnippet(snippet: Snippet): Promise<void> {
    for (const poster of this.posters) {
      try {
        await poster.post(snippet);
        console.log(`[POST-MANAGER] Successfully posted snippet to ${poster.constructor.name}`);
      } catch (error) {
        console.error(`[POST-MANAGER] Failed to post snippet to ${poster.constructor.name}:`, error);
      }
    }
  }
}