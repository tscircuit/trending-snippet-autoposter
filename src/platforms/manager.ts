export class PostManager {
  private posters: PlatformPoster[];

  constructor(posters: PlatformPoster[]) {
    this.posters = posters;
    console.log('[POST-MANAGER] Initialized with posters:', posters.map(poster => poster.constructor.name).join(', '));
  }

  async postSnippet(snippet: Snippet): Promise<{ successes: number, failures: number , skipped : number}> {
    let successes = 0;
    let failures = 0;
    let skipped = 0;

    for (const poster of this.posters) {
      try {
        const isPostedSucessfully = await poster.post(snippet);
        console.log(`[POST-MANAGER] ${isPostedSucessfully ?'Successfully posted' : 'Tried posting'} snippet to ${poster.constructor.name}`);
        if(isPostedSucessfully) successes++;
        else skipped++
      } catch (error: any) {
        console.error(`[POST-MANAGER] Failed to post snippet to ${poster.constructor.name}:`, error.message);
        failures++;
      }
    }

    console.info(`\n[POST-SUMMARY] Posting summary: ${successes} successes, ${failures} failures ${skipped} Skipped`);
    return { successes, failures,skipped };
  }
}