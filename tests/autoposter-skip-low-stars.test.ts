import { expect, test } from "bun:test";
import { getTestServer } from "@tscircuit/fake-reddit/tests/fixtures/get-test-server";
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import main from "../src/index";
import "@tscircuit/fake-snippets";

// Mock the trending API response
const mockTrendingResponse = {
  snippets: [
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

test("autoposter skips snippets with less than 2 stars", async () => {
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
  
  // Verify no new post was created (low-star snippet was skipped)
  const response = await axios.get(`${baseUrl}/api/info`);
  const submissions = response.data.data.children;
  
  expect(submissions).toHaveLength(0);

  await server.stop();
});
