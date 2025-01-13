import { expect, test, mock } from "bun:test";
import { getTestServer } from "../../fake-reddit/tests/fixtures/get-test-server";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
import main from "../index";

// Mock the trending API response
const mockTrendingResponse = {
  snippets: [
    {
      snippet_id: "123",
      unscoped_name: "test-snippet",
      name: "owner/test-snippet",
      owner_name: "owner",
      code: "console.log('test')",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      snippet_type: "board",
      description: "Test snippet",
      star_count: 3
    },
    {
      snippet_id: "456",
      unscoped_name: "low-stars",
      name: "owner/low-stars",
      owner_name: "owner",
      code: "console.log('low')",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      snippet_type: "board",
      description: "Low stars snippet",
      star_count: 1
    }
  ]
};

// Mock axios for the trending API
const originalAxios = globalThis.axios;
mock.module("axios", () => ({
  ...originalAxios,
  get: async (url: string) => {
    if (url === "https://registry-api.tscircuit.com/snippets/list_trending") {
      return { data: mockTrendingResponse };
    }
    return originalAxios.get(url);
  }
}));

// Helper to clean up test files
async function cleanup() {
  try {
    await fs.unlink("previous-trending-snippets.json");
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

test("autoposter selects most starred unposted snippet", async () => {
  await cleanup();
  
  // Start fake Reddit server
  const { server, url: baseUrl } = await getTestServer();
  
  try {
    process.env.FAKE_REDDIT_URL = baseUrl;
    await main();
    
    // Verify the post was created with correct content
    const response = await axios.get(`${baseUrl}/posts/list`);
    const posts = response.data.posts;
    
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toContain("owner/test-snippet");
    expect(posts[0].body).toContain("Test snippet");
    expect(posts[0].body).toContain("3");
    
    // Verify tracking file was created
    const tracking = JSON.parse(
      await fs.readFile("previous-trending-snippets.json", "utf-8")
    );
    expect(tracking.posted_snippets).toContain("123");
  } finally {
    delete process.env.FAKE_REDDIT_URL;
    await server.stop();
  }
});

test("autoposter skips snippets with less than 2 stars", async () => {
  await cleanup();
  
  // Start fake Reddit server
  const { server, url: baseUrl } = await getTestServer();
  
  try {
    // Mark high-star snippet as already posted
    await fs.writeFile(
      "previous-trending-snippets.json",
      JSON.stringify({ posted_snippets: ["123"] })
    );
    
    process.env.FAKE_REDDIT_URL = baseUrl;
    await main();
    
    // Verify no new post was created (low-star snippet was skipped)
    const response = await axios.get(`${baseUrl}/posts/list`);
    const posts = response.data.posts;
    
    expect(posts).toHaveLength(0);
  } finally {
    delete process.env.FAKE_REDDIT_URL;
    await server.stop();
    await fs.unlink("previous-trending-snippets.json").catch(() => {});
  }
});

test("autoposter handles API errors gracefully", async () => {
  await cleanup();

  // Start fake Reddit server
  const { server, url: baseUrl } = await getTestServer();
  
  try {
    // Mock API error
    mock.module("axios", () => ({
      default: {
        get: async () => {
          throw new Error("API Error");
        },
        post: async (url: string, data: any) => axios.post(url, data)
      }
    }));

    let exitCode = 0;
    mock.module("process", () => ({
      exit: (code: number) => {
        exitCode = code;
      }
    }));

    process.env.FAKE_REDDIT_URL = baseUrl;
    await main();

    expect(exitCode).toBe(1);
  } finally {
    delete process.env.FAKE_REDDIT_URL;
    await server.stop();
    await cleanup();
  }
});
