import { expect, test} from "bun:test";
import { getTestServer } from "@tscircuit/fake-reddit/tests/fixtures/get-test-server";
import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import main from "../src/index";
import "@tscircuit/fake-snippets";

test("autoposter handles API errors gracefully", async () => {
  let exitCode = 0;
  const originalExit = process.exit;
  
  // Mock process.exit
  process.exit = ((code: number) => {
    exitCode = code;
    return undefined as never;
  }) as typeof process.exit;
  
  // Start fake Reddit server
  const { server, url: baseUrl } = await getTestServer();
  
  // Force trending API to error
  const originalGet = axios.get;
  axios.get = async <T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> => {
    if (url.includes("/snippets/list_trending")) {
      throw new Error("API Error");
    }
    return originalGet(url);
  };

  try {
    await main();
  } catch (error) {
    // Error should be caught by main and trigger process.exit(1)
  }

  expect(exitCode).toBe(1);
  process.exit = originalExit;
  await server.stop();
});
