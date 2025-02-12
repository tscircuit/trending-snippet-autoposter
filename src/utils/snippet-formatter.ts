export class SnippetFormattingManager {
  // Helper: Short description or fallback
  public shortDescription(snippet: Snippet): string {
    return snippet.description || 'No description available';
  }

  // Helper: Full code block
  public fullCode(snippet: Snippet): string {
    return `\`\`\`${snippet.code}\`\`\``;
  }

  // Helper: Truncated code block with a customizable length
  public truncatedCode(snippet: Snippet, maxLength: number): string {
    return `\`\`\`${snippet.code.substring(0, maxLength)}...\`\`\``;
  }

  // Format for Twitter (shortened content)
  public formatForTwitter(snippet: Snippet): string {
    return `
      🚀 New Trending Snippet: ${snippet.name}
      Description: ${this.shortDescription(snippet)}
      Stars: ${snippet.star_count}
      Code: ${this.truncatedCode(snippet, 100)}
    `;
  }

  // Format for Reddit (full content)
  public formatForReddit(snippet: Snippet): string {
    return `
      🚀 New Trending Snippet: ${snippet.name}
      Description: ${this.shortDescription(snippet)}
      Stars: ${snippet.star_count}
      Code: ${this.fullCode(snippet)}
    `;
  }

  // Format for Discord (medium-length content)
  public formatForDiscord(snippet: Snippet): string {
    return `
      🚀 New Trending Snippet: ${snippet.name}
      Description: ${this.shortDescription(snippet)}
      Stars: ${snippet.star_count}
      Code: ${this.truncatedCode(snippet, 500)}
    `;
  }
}

export const SnippetFormatter = new SnippetFormattingManager()
