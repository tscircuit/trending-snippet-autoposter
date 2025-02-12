import { TwitterPoster } from "@/platforms/twitter";
import { RedditPoster } from "@/platforms/reddit";
import { DiscordPoster } from "@/platforms/discord";
import { PostManager } from "@/platforms/manager";
import { fetchTrendingSnippets } from "@/snippets/fetch-trending-snippets";
import {
    loadPostedSnippets,
    savePostedSnippet,
} from "@/snippets/track-posted-snippets";
import { consola } from "consola";

export default async function main() {
    consola.ready({
        message: "Starting process",
        tag: "Index",
    });

    const snippets = await fetchTrendingSnippets();
    const postedSnippets = loadPostedSnippets();

    const snippetToPost = snippets.find(
        (snippet: Snippet) => !postedSnippets.includes(snippet.snippet_id)
    );

    if (!snippetToPost) {
        consola.warn({
            message: "No new snippets to post.",
            badge: "Index",
        });
        return;
    }

    const twitterPoster = new TwitterPoster();
    const redditPoster = new RedditPoster();
    const discordPoster = new DiscordPoster();

    const postManager = new PostManager([
        twitterPoster,
        redditPoster,
        discordPoster,
    ]);

    await postManager.postSnippet(snippetToPost);

    savePostedSnippet(snippetToPost.snippet_id);

    consola.success({
        message: "Script Completed Successfully",
        badge: "index",
    });
}

if (import.meta.main) {
    main().catch((error) =>
        console.error("[INDEX] Main function failed:", error)
    );
}
