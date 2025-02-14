import { WebhookClient, EmbedBuilder } from "discord.js";
import { SnippetFormatter } from "@/utils/snippet-formatter";
import { THEME_COLOR } from "@/consts";
import debug from "debug";

export class DiscordPoster implements PlatformPoster {
  private webhook: WebhookClient | null = null;

  constructor() {
    if (!process.env.DISCORD_WEBHOOK_URL) {
      console.error(
        "[DISCORD-POSTER] Missing Discord webhook URL. Skipping Discord posting.",
      );
      return;
    }
    this.webhook = new WebhookClient({
      url: process.env.DISCORD_WEBHOOK_URL,
    });
  }

  async post(snippet: Snippet) {
    if (!this.webhook) {
      debug("[DISCORD-POSTER] Discord webhook not initialized. Skipping post.");
      return;
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle(`🚀 New Trending Snippet: ${snippet.name}`)
        .setURL(`https://tscircuit.com/${snippet.name}`)
        .setAuthor({
          name: snippet.owner_name,
          iconURL: `https://github.com/${snippet.owner_name}.png`,
          url: `https://github.com/@${snippet.owner_name}`,
        })
        .setDescription(
          `\`\`\`${SnippetFormatter.fullDescription(snippet)}\`\`\``,
        )
        .setColor(THEME_COLOR)
        .addFields(
          {
            name: "⭐ Stars",
            value: `**${snippet.star_count}**`,
            inline: true,
          },
          {
            name: "📅 Created",
            value: `<t:${Math.floor(
              new Date(snippet.created_at).getTime() / 1000,
            )}:R>`,
            inline: true,
          },
          {
            name: "🍳 Type",
            value: `**\`${snippet.snippet_type}\`**`,
            inline: true,
          },
        )
        .addFields({
          name: "📌 Code Preview",
          value: `\`\`\`typescript\n\n\n${SnippetFormatter.truncatedCode(
            snippet,
            200,
          )}\n\`\`\``,
          inline: false,
        })
        .setImage(`https://registry-api.tscircuit.com/snippets/images/${snippet.name}/schematic.svg`}
        .setTimestamp(new Date(snippet.updated_at))
        .setFooter({
          text: "Tscircuit Trending Snippets",
          iconURL: "https://github.com/tscircuit.png",
        });

      await this.webhook.send({
        content: "",
        embeds: [embed],
      });

      debug(
        `[DISCORD-POSTER] Successfully posted snippet to Discord: ${snippet.name}`,
      );
      return true;
    } catch (error) {
      console.error(
        `[DISCORD-POSTER] Failed to post snippet to Discord:`,
        error,
      );
    }
  }
}
