import { expect, test} from "bun:test";
import { getTestServer } from "@tscircuit/fake-reddit/tests/fixtures/get-test-server";
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import main from "../src/index";
import "@tscircuit/fake-snippets";

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
    }
  ]
};

test("autoposter selects most starred unposted snippet", async () => {
  // Start fake Reddit server
  const { server, url: baseUrl } = await getTestServer();
  
  // Mock axios for trending API
  const originalGet = axios.get;
  axios.get = async <T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> => {
    if (url.includes("/snippets/list_trending")) {
      return {
        data: mockTrendingResponse,
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json" },
        config: { headers: { "content-type": "application/json" } }
      } as R;
    }
    return originalGet(url);
  };

  await main();
  
  // Verify the post was created with correct content
  const response = await axios.get(`${baseUrl}/api/info`);
  const submissions = response.data.data.children;
  
  expect(submissions).toHaveLength(1);
  
  // Get the latest post
  const post = submissions[0].data;
  expect(post.subreddit).toBe("tscircuit");
  expect(post.title).toBe(`${mockTrendingResponse.snippets[0].name}: ${mockTrendingResponse.snippets[0].description}`);
  expect(post.author).toBe(mockTrendingResponse.snippets[0].owner_name);
  expect(post.score).toBe(mockTrendingResponse.snippets[0].star_count);
  expect(post.selftext).toContain(mockTrendingResponse.snippets[0].code);
  expect(post.selftext).toContain(mockTrendingResponse.snippets[0].snippet_type);

  await server.stop();
});
