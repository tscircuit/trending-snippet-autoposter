// import { Client } from 'twitter-api-v2';
// import { postToReddit } from '@tscircuit/fake-reddit';

// const twitterClient = new Client(process.env.TWITTER_API_KEY);

export async function postSnippet(snippet: any) {
  const message = `
    🚀 New Trending Snippet: ${snippet.name}
    Description: ${snippet.description || 'No description available'}
    Stars: ${snippet.star_count}
    Code: \`\`\`${snippet.code}\`\`\`
  `;

  // Post to Twitter
//   await twitterClient.v2.tweet(message);

  // Post to Reddit
//   await postToReddit({
//     title: `New Trending Snippet: ${snippet.name}`,
//     content: message,
//   });
}