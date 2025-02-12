import { SnippetFormatter } from '@/utils/snippet-formatter';
import { WebhookClient, EmbedBuilder } from 'discord.js';

export class DiscordPoster implements PlatformPoster {
  private webhook: WebhookClient;

  constructor(webhookUrl: string = Bun.env.DISCORD_WEBHOOK_URL) {
    this.webhook = new WebhookClient({ url: webhookUrl });
  }

  async post(snippet: Snippet): Promise<void> {
    const title = `New Trending Snippet: ${snippet.name}`;
    const description = SnippetFormatter.shortDescription(snippet);
    const stars = snippet.star_count;
    const code = SnippetFormatter.truncatedCode(snippet, 500);

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x00FFFF) 
      .addFields({ name: 'Stars', value: `${stars}`, inline: true })
      .addFields({ name: 'Code', value: `${code}`, inline: false });

      await this.webhook.send({
        content: '',
        embeds: [embed],
      });
  }
}