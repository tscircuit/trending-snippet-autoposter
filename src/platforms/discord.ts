import { WebhookClient, EmbedBuilder } from 'discord.js';
import { SnippetFormatter } from '@/utils/snippet-formatter';
import { THEME_COLOR } from '@/consts';

export class DiscordPoster implements PlatformPoster {
  private webhook: WebhookClient | null = null;

  constructor() {
    if (!Bun.env.DISCORD_WEBHOOK_URL) {
      console.error('[DISCORD-POSTER] Missing Discord webhook URL. Skipping Discord posting.');
      return;
    }
    this.webhook = new WebhookClient({ url: Bun.env.DISCORD_WEBHOOK_URL });
  }

  async post(snippet: Snippet){
    if (!this.webhook) {
      console.error('[DISCORD-POSTER] Discord webhook not initialized. Skipping post.');
      return;
    }

    try {
      const title = `New Trending Snippet: ${snippet.name}`;
      const description = SnippetFormatter.shortDescription(snippet);
      const stars = snippet.star_count;
      const code = SnippetFormatter.truncatedCode(snippet, 500);

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(THEME_COLOR)
        .addFields({ name: 'Stars', value: `${stars}`, inline: true })
        .addFields({ name: 'Code', value: code, inline: false });

      await this.webhook.send({
        content: '',
        embeds: [embed],
      });

      console.log(`[DISCORD-POSTER] Successfully posted snippet to Discord: ${title}`);
      return true
    } catch (error) {
      console.error(`[DISCORD-POSTER] Failed to post snippet to Discord:`, error);
    }
  }
}