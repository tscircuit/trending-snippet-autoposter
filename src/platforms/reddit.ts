import { SnippetFormatter } from "@/utils/snippet-formatter";
import debug from "debug";

export class RedditPoster implements PlatformPoster {
  private accessToken: string | null = null;
  private userAgent: string | null = null;
  private subreddit: string | null = null;

  constructor() {
    this.userAgent = process.env.REDDIT_USER_AGENT || "MyRedditApp/1.0";
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;
    this.subreddit = process.env.REDDIT_SUBREDDIT || "tscircuit";

    if (
      !this.userAgent ||
      !clientId ||
      !clientSecret ||
      !username ||
      !password ||
      !this.subreddit
    ) {
      console.error(
        "[REDDIT-POSTER] Missing Reddit API credentials. Skipping Reddit " +
          "posting.",
      );
      return;
    }

    this.getAccessToken(clientId, clientSecret, username, password)
      .then((token) => {
        this.accessToken = token;
        debug("[REDDIT-POSTER] Reddit access token obtained successfully.");
      })
      .catch((error) => {
        console.error(
          "[REDDIT-POSTER] Failed to obtain Reddit access token:",
          error,
        );
        this.accessToken = null;
      });
  }

  private async getAccessToken(
    clientId: string,
    clientSecret: string,
    username: string,
    password: string,
  ): Promise<string> {
    const tokenEndpoint = "https://www.reddit.com/api/v1/access_token";
    const authString = btoa(`${clientId}:${clientSecret}`); // Base64 encode
    const formData = new FormData();
    formData.append("grant_type", "password");
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "User-Agent": this.userAgent || "MyRedditApp/1.0",
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Failed to obtain access token: ${response.status} ${response.statusText} - ${JSON.stringify(
          data,
        )}`,
      );
    }

    return data.access_token;
  }

  async post(snippet: Snippet) {
    throw Error("not implemented");
    if (!this.accessToken || !this.userAgent || !this.subreddit) {
      debug(
        "[REDDIT-POSTER] Reddit access token or user agent not initialized. " +
          "Skipping post.",
      );
      return false;
    }

    try {
      const title = `New Trending Snippet: ${snippet.name}`;
      const content = SnippetFormatter.formatForReddit(snippet);
      const submitEndpoint = "https://oauth.reddit.com/api/submit";

      const formData = new FormData();
      formData.append("api_type", "json");
      formData.append("kind", "self");
      formData.append("sr", this.subreddit);
      formData.append("title", title);
      formData.append("text", content);

      const response = await fetch(submitEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "User-Agent": this.userAgent,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Failed to post snippet: ${response.status} ${response.statusText} - ${JSON.stringify(
            data,
          )}`,
        );
      }

      debug(`[REDDIT-POSTER] Successfully posted snippet to Reddit: ${title}`);
      return true;
    } catch (error) {
      console.error(`[REDDIT-POSTER] Failed to post snippet to Reddit:`, error);
      return false;
    }
  }
}

if (import.meta.main) {
  const data = {
    snippet_id: "5975e918-0796-4ab2-83fe-5841ef6fbed6",
    name: "techmannih/wifi-test-board-1",
    owner_name: "techmannih",
    code: 'import { Reg5vTo3v3 } from "@tsci/seveibar.reg-5v-to-3v"\nimport { useESP32_S3_MINI_1_N8 } from "@tsci/seveibar.esp32-s3-mini-1-n8"\nimport { useUsbC } from "@tsci/seveibar.smd-usb-c"\nimport { useResistor } from "@tscircuit/core"\n\nexport default () =\u003E {\n  const Usb = useUsbC("USB")\n  const Esp32 = useESP32_S3_MINI_1_N8("U1")\n  const R1 = useResistor("R1", { resistance: "5.1k", footprint: "0402" })\n  const R2 = useResistor("R2", { resistance: "5.1k", footprint: "0402" })\n  \n  return (\n    \u003Cboard width="20mm" height="48mm" schAutoLayoutEnabled\u003E\n      \u003CUsb\n        pcbY={-20}\n      /\u003E\n      \u003CEsp32 pcbY={5} /\u003E\n      \u003CReg5vTo3v3 pcbX={2} pcbY={-12} /\u003E\n      \u003CR1 pcbX={-5} pcbY={-15} pin1={Usb.CC1} pin2="net.gnd" /\u003E\n      \u003CR2 pcbX={-5} pcbY={-12} pin1={Usb.CC2} pin2="net.gnd" /\u003E\n    \u003C/board\u003E\n  )\n}',
    created_at: "2025-01-09T18:51:55.543Z",
    updated_at: "2025-01-09T18:51:59.802Z",
    snippet_type: "board",
    description: "",
    star_count: 1,
  } as Snippet;
  const poster = new RedditPoster();
  poster.post(data);
}
