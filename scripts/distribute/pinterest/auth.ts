/**
 * auth.ts — Pinterest OAuth flow to get and save access token
 *
 * Usage (one-time):
 *   npx tsx scripts/distribute/pinterest/auth.ts
 *
 * Opens browser for Pinterest OAuth, catches redirect on localhost:8085,
 * exchanges code for tokens, saves to .pinterest-token.json
 */

import * as dotenv from "dotenv";
dotenv.config();

import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";

const TOKEN_FILE = path.resolve(".pinterest-token.json");
const PORT = 8085;
const REDIRECT_URI = `https://localhost:${PORT}/callback`;
const SCOPES = "boards:read,boards:write,pins:read,pins:write";

interface PinterestTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  saved_at: string;
}

function getCredentials() {
  const appId = process.env.PINTEREST_APP_ID;
  const appSecret = process.env.PINTEREST_APP_SECRET;

  if (!appId || !appSecret) {
    console.error(
      "Error: PINTEREST_APP_ID and PINTEREST_APP_SECRET must be set in .env\n" +
        "Get these from https://developers.pinterest.com → Your app"
    );
    process.exit(1);
  }
  return { appId, appSecret };
}

async function exchangeCodeForToken(
  code: string,
  appId: string,
  appSecret: string
): Promise<PinterestTokens> {
  const auth = Buffer.from(`${appId}:${appSecret}`).toString("base64");

  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return { ...data, saved_at: new Date().toISOString() };
}

async function refreshAccessToken(
  refreshToken: string,
  appId: string,
  appSecret: string
): Promise<PinterestTokens> {
  const auth = Buffer.from(`${appId}:${appSecret}`).toString("base64");

  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return { ...data, saved_at: new Date().toISOString() };
}

/**
 * Get a valid Pinterest access token. Auto-refreshes if expiring within 7 days.
 * Used by all other pinterest scripts.
 */
export async function getValidToken(): Promise<string> {
  if (!fs.existsSync(TOKEN_FILE)) {
    console.error(
      "No Pinterest token found. Run the auth flow first:\n" +
        "  npx tsx scripts/distribute/pinterest/auth.ts"
    );
    process.exit(1);
  }

  const tokens: PinterestTokens = JSON.parse(
    fs.readFileSync(TOKEN_FILE, "utf-8")
  );
  const savedAt = new Date(tokens.saved_at).getTime();
  const expiresAt = savedAt + tokens.expires_in * 1000;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (Date.now() + sevenDaysMs > expiresAt) {
    console.log("  Pinterest token expiring soon — refreshing...");
    const { appId, appSecret } = getCredentials();
    const refreshed = await refreshAccessToken(
      tokens.refresh_token,
      appId,
      appSecret
    );
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(refreshed, null, 2));
    console.log("  Token refreshed and saved.");
    return refreshed.access_token;
  }

  return tokens.access_token;
}

// --- Main auth flow (run directly) ---

function main() {
  const { appId } = getCredentials();

  const authUrl =
    `https://www.pinterest.com/oauth/?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPES)}`;

  console.log("\n  Pinterest OAuth Flow");
  console.log("  " + "=".repeat(40));
  console.log("  Opening browser for authorization...\n");

  // Open browser
  const openCmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${openCmd} "${authUrl}"`);

  // Start local server to catch redirect
  const server = http.createServer(async (req, res) => {
    if (!req.url?.startsWith("/callback")) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const url = new URL(req.url, `http://localhost:${PORT}`);
    const code = url.searchParams.get("code");

    if (!code) {
      res.writeHead(400);
      res.end("No authorization code received");
      console.error("  Error: No authorization code in redirect");
      server.close();
      process.exit(1);
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      "<h2>Authentication successful!</h2><p>You can close this tab.</p>"
    );

    try {
      const { appId, appSecret } = getCredentials();
      const tokens = await exchangeCodeForToken(code, appId, appSecret);
      fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
      console.log("  Authentication successful. Token saved to .pinterest-token.json");
      console.log(`  Token expires in ${Math.round(tokens.expires_in / 86400)} days`);
    } catch (e) {
      console.error(`  Error: ${(e as Error).message}`);
    }

    server.close();
    process.exit(0);
  });

  server.listen(PORT, () => {
    console.log(`  Waiting for redirect on http://localhost:${PORT}/callback ...`);
    console.log("  If browser didn't open, visit this URL manually:");
    console.log(`  ${authUrl}\n`);
  });
}

// Only run main if executed directly (not imported)
const isMainModule = process.argv[1]?.includes("auth.ts");
if (isMainModule) {
  main();
}
