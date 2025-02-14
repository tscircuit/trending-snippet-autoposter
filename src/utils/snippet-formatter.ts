export class SnippetFormattingManager {
  public shortDescription(snippet: Snippet): string {
    return snippet.description
      ? snippet.description.substring(0, 25)
      : "No description available";
  }

  public fullDescription(snippet: Snippet): string {
    return snippet.description || "No description available";
  }

  public fullCode(snippet: Snippet): string {
    return `${snippet.code}`;
  }

  public truncatedCode(snippet: Snippet, maxLength: number): string {
    return `${snippet.code.substring(0, maxLength)}...`;
  }

  public formatForTwitter(snippet: Snippet): string {
    return `
      🚀 New Trending Snippet: ${snippet.name}
      Description: ${this.shortDescription(snippet)}
      Stars: ${snippet.star_count}
      Code: ${this.truncatedCode(snippet, 100)}
    `;
  }

  public formatForReddit(snippet: Snippet): string {
    return `
      🚀 New Trending Snippet: ${snippet.name}
      Description: ${this.shortDescription(snippet)}
      Stars: ${snippet.star_count}
      Code: ${this.fullCode(snippet)}
    `;
  }

  public formatForDiscord(snippet: Snippet): string {
    return `
      🚀 New Trending Snippet: ${snippet.name}
      Description: ${this.shortDescription(snippet)}
      Stars: ${snippet.star_count}
      Code: ${this.truncatedCode(snippet, 500)}
    `;
  }
}

export const SnippetFormatter = new SnippetFormattingManager();
