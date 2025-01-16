import { expect, test, mock, beforeEach, afterEach } from "bun:test";
import { getTestServer } from "@tscircuit/fake-reddit/tests/fixtures/get-test-server";
import fs from "fs/promises";
import path from "path";
import axios from "axios";
import type { AxiosResponse, AxiosRequestConfig } from "axios";
import main from "../src/index";

// Mock the trending API response
const mockTrendingResponse = {
  snippets: [
    {
      snippet_id: "test-123",
      unscoped_name: "test-snippet",
      name: "test/test-snippet",
      owner_name: "test",
      code: "console.log('test')",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      snippet_type: "board",
      description: "Test snippet description",
      star_count: 3
    },
    {
      snippet_id: "test-456",
      unscoped_name: "low-stars",
      name: "test/low-stars",
      owner_name: "test",
      code: "console.log('low')",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
      snippet_type: "board",
      description: "Low stars snippet",
      star_count: 1
    }
  ]
};

// Override trending API URL for tests
process.env.TRENDING_API_URL = "http://localhost:3001/snippets/list_trending";

// Mock axios for trending API
const originalGet = axios.get;
const originalPost = axios.post;

// Restore original axios methods after each test
afterEach(() => {
  axios.get = originalGet;
  axios.post = originalPost;
});

// Set up mocks and cleanup before each test
beforeEach(async () => {
  await cleanup();
  
  // Mock axios completely to control all requests
  const mockedGet = async <T = any, R = AxiosResponse<T>>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<R> => {
    if (url === process.env.TRENDING_API_URL) {
      return { 
        data: mockTrendingResponse,
        status: 200,
        statusText: "OK",
        headers: {},
        config: {}
      } as R;
    }
    // Let other requests go through, but with our auth header
    return originalGet(url, {
      ...config,
      headers: {
        Authorization: "Bearer test-token",
        ...(config?.headers || {})
      }
    });
  };
  
  // Replace axios methods
  axios.get = mockedGet;
  axios.post = async (url: string, data: any, config?: AxiosRequestConfig) => {
    return originalPost(url, data, {
      ...config,
      headers: {
        Authorization: "Bearer test-token",
        ...(config?.headers || {})
      }
    });
  };
});

// Helper to clean up test files
async function cleanup() {
  try {
    await fs.unlink("previous-trending-snippets.json");
  } catch (error) {
    // Ignore if file doesn't exist
  }
}

let currentMockServer: ReturnType<typeof Bun.serve>;

beforeEach(async () => {
  await cleanup();
  // Start a fresh mock trending server before each test
  await new Promise(resolve => setTimeout(resolve, 100)); // Wait for port to be available
  currentMockServer = Bun.serve({
    port: 3001,
    fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/snippets/list_trending") {
        return new Response(JSON.stringify(mockTrendingResponse), {
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response("Not Found", { status: 404 });
    }
  });
});

afterEach(async () => {
  // Stop the current mock server after each test
  if (currentMockServer) {
    currentMockServer.stop();
  }
  // Restore original axios methods
  axios.get = originalGet;
  axios.post = originalPost;
  // Ensure cleanup is complete
  await cleanup();
});

test("autoposter selects most starred unposted snippet", async () => {
  await cleanup();
  
  // Start fake Reddit server
  const { server, url: baseUrl } = await getTestServer();
  
  try {
    process.env.FAKE_REDDIT_URL = baseUrl;
    await main();
    
    // Verify the post was created with correct content using /api/info
    const response = await axios.get(`${baseUrl}/api/info`, {
      headers: { Authorization: "Bearer test-token" }
    });
    const submissions = response.data.data.children;
    
    expect(submissions).toHaveLength(1);
    
    // Get the latest post
    const post = submissions[0].data;
    expect(post.subreddit).toBe("tscircuit");
    expect(post.title).toBe(`${mockTrendingResponse.snippets[0].name}: ${mockTrendingResponse.snippets[0].description}`);
    
    // Verify post metadata matches snippet data
    expect(post.author).toBe(mockTrendingResponse.snippets[0].owner_name);
    expect(post.score).toBe(mockTrendingResponse.snippets[0].star_count);
    
    // Verify the selftext contains the code
    expect(post.selftext).toContain(mockTrendingResponse.snippets[0].code);
    expect(post.selftext).toContain(mockTrendingResponse.snippets[0].snippet_type);
    
    // Verify tracking file was created
    const tracking = JSON.parse(
      await fs.readFile("previous-trending-snippets.json", "utf-8")
    );
    expect(tracking.posted_snippets).toContain(mockTrendingResponse.snippets[0].snippet_id);
  } finally {
    delete process.env.FAKE_REDDIT_URL;
    await server.stop();
    await cleanup();
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
      JSON.stringify({ posted_snippets: ["test-123"] })
    );
    
    process.env.FAKE_REDDIT_URL = baseUrl;
    await main();
    
    // Verify no new post was created (low-star snippet was skipped)
    const response = await axios.get(`${baseUrl}/api/info`, {
      headers: { Authorization: "Bearer test-token" }
    });
    const submissions = response.data.data.children;
    
    expect(submissions).toHaveLength(0);
  } finally {
    delete process.env.FAKE_REDDIT_URL;
    await server.stop();
    await cleanup();
  }
});

test("autoposter handles API errors gracefully", async () => {
  let exitCode = 0;
  const originalExit = process.exit;
  let server: any;
  
  try {
    // Mock process.exit first
    process.exit = ((code: number) => {
      exitCode = code;
      return undefined as never;
    }) as typeof process.exit;
    
    // Start fake Reddit server
    const testServer = await getTestServer();
    server = testServer.server;
    process.env.FAKE_REDDIT_URL = testServer.url;
    
    // Force trending API to error
    const errorGet = axios.get;
    axios.get = async (url: string, config?: AxiosRequestConfig) => {
      if (url === process.env.TRENDING_API_URL) {
        throw new Error("API Error");
      }
      return errorGet(url, {
        ...config,
        headers: {
          ...config?.headers,
          Authorization: "Bearer test-token"
        }
      });
    };

    await main();
  } catch (error) {
    // Error should be caught by main and trigger process.exit(1)
  } finally {
    expect(exitCode).toBe(1);
    process.exit = originalExit;
    if (server) await server.stop();
    delete process.env.FAKE_REDDIT_URL;
    await cleanup();
  }
});