interface Snippet {
    snippet_id: string;
    unscoped_name: string;
    name: string;
    owner_name: string;
    code: string;
    created_at: string;
    updated_at: string;
    snippet_type: string;
    description: string;
    star_count: number;
}

interface PlatformPoster {
    post(snippet: Snippet): Promise<boolean | undefined>;
}

declare module "bun" {
    interface Env {
        TWITTER_TOKEN: string;
        REDDIT_TOKEN: string;
        DISCORD_WEBHOOK_URL: string;
    }
}
