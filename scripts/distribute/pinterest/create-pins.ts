/**
 * create-pins.ts — Create 3 Pinterest pins for a blog post
 *
 * Usage:
 *   npx tsx scripts/distribute/pinterest/create-pins.ts \
 *     scripts/blog/drafts/{slug}.json \
 *     scripts/blog/drafts/{slug}-distribution.md
 */

import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";
import { getValidToken } from "./auth";
import { getBoardForCategory } from "./setup-boards";
import { generatePinImage } from "./image-generator";

const API_BASE = "https://api.pinterest.com/v5";
const SITE_URL = "https://nurture.org.in";
const BOARDS_FILE = path.resolve("scripts/distribute/pinterest/boards.json");
const PIN_LOG_FILE = path.resolve(
  "scripts/distribute/pinterest/pin-log.json"
);

interface PinData {
  title: string;
  description: string;
  board: string;
}

function extractPinterestPins(distributionMd: string): PinData[] {
  const pins: PinData[] = [];
  const pinPattern =
    /\*\*Pin (\d).*?\*\*\s*\nTitle:\s*(.*?)\nBoard:\s*(.*?)\nDescription:\s*([\s\S]*?)(?=\n\*\*Pin|\n---|\n##|$)/gi;

  let match: RegExpExecArray | null;
  while ((match = pinPattern.exec(distributionMd)) !== null) {
    pins.push({
      title: match[2].trim(),
      description: match[4].trim().replace(/\n/g, " "),
      board: match[3].trim(),
    });
  }

  return pins;
}

function loadBoardIds(): Record<string, string> {
  if (!fs.existsSync(BOARDS_FILE)) {
    console.error(
      "Error: boards.json not found. Run setup-boards.ts first:\n" +
        "  npx tsx scripts/distribute/pinterest/setup-boards.ts"
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(BOARDS_FILE, "utf-8"));
}

function findBoardId(
  boardName: string,
  boardIds: Record<string, string>
): string | null {
  // Exact match
  if (boardIds[boardName]) return boardIds[boardName];

  // Fuzzy match (handle minor differences like & vs "and")
  const normalise = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalise(boardName);

  for (const [name, id] of Object.entries(boardIds)) {
    if (normalise(name) === target) return id;
  }

  return null;
}

async function apiCall(
  endpoint: string,
  token: string,
  method = "GET",
  body?: Record<string, unknown>
) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinterest API (${res.status}): ${err}`);
  }

  return res.json();
}

async function createPin(
  token: string,
  boardId: string,
  title: string,
  description: string,
  link: string,
  imagePath: string,
  scheduledAt?: string
): Promise<{ id: string; url: string }> {
  // Read image and convert to base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString("base64");

  const pinBody: Record<string, unknown> = {
    board_id: boardId,
    title,
    description,
    link,
    media_source: {
      source_type: "image_base64",
      content_type: "image/png",
      data: base64Image,
    },
  };

  if (scheduledAt) {
    pinBody.publish_at = scheduledAt;
  }

  // Rate limit: 1 second delay before each call
  await new Promise((r) => setTimeout(r, 1000));

  const result = await apiCall("/pins", token, "POST", pinBody);

  return {
    id: result.id,
    url: `https://pinterest.com/pin/${result.id}`,
  };
}

function updatePinLog(
  slug: string,
  pins: Array<{
    pinNumber: number;
    pinId: string;
    url: string;
    boardName: string;
    title: string;
    status: string;
    scheduledFor?: string;
  }>
) {
  let log: { pins: unknown[] } = { pins: [] };
  if (fs.existsSync(PIN_LOG_FILE)) {
    log = JSON.parse(fs.readFileSync(PIN_LOG_FILE, "utf-8"));
  }

  log.pins.push({
    slug,
    createdAt: new Date().toISOString(),
    pins,
  });

  fs.writeFileSync(PIN_LOG_FILE, JSON.stringify(log, null, 2));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] === "--help") {
    console.log(
      "Usage: npx tsx scripts/distribute/pinterest/create-pins.ts \\\n" +
        "  scripts/blog/drafts/{slug}.json \\\n" +
        "  scripts/blog/drafts/{slug}-distribution.md"
    );
    process.exit(0);
  }

  const postJsonPath = path.resolve(args[0]);
  const distMdPath = path.resolve(args[1]);

  if (!fs.existsSync(postJsonPath)) {
    console.error(`Error: Post JSON not found: ${postJsonPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(distMdPath)) {
    console.error(`Error: Distribution MD not found: ${distMdPath}`);
    process.exit(1);
  }

  const postData = JSON.parse(fs.readFileSync(postJsonPath, "utf-8"));
  const distMd = fs.readFileSync(distMdPath, "utf-8");
  const slug = postData.slug as string;
  const coverImage = postData.coverImage as string | null;
  const categories = (postData.categories as string[]) || [];

  console.log("\n  Pinterest Pin Creator");
  console.log("  " + "=".repeat(40));
  console.log(`  Post: ${postData.title}`);
  console.log(`  Slug: ${slug}\n`);

  // Extract pin data from distribution markdown
  const pins = extractPinterestPins(distMd);
  if (pins.length === 0) {
    console.error(
      "  Error: Could not extract Pinterest pin data from distribution.md\n" +
        "  Make sure Section 4b has the correct format."
    );
    process.exit(1);
  }

  // Load board IDs
  const boardIds = loadBoardIds();
  const token = await getValidToken();
  const link = `${SITE_URL}/blog/${slug}`;

  // Schedule: Pin 1 now, Pin 2 tomorrow, Pin 3 day after
  const now = new Date();
  const schedules = [
    undefined, // Pin 1: now
    new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Pin 2: +1 day
    new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(), // Pin 3: +2 days
  ];

  const pinResults: Array<{
    pinNumber: number;
    pinId: string;
    url: string;
    boardName: string;
    title: string;
    status: string;
    scheduledFor?: string;
  }> = [];

  for (let i = 0; i < Math.min(pins.length, 3); i++) {
    const pin = pins[i];
    const pinNum = i + 1;

    console.log(`  Generating image for Pin ${pinNum}...`);
    const imagePath = await generatePinImage({
      slug,
      title: pin.title,
      coverImageUrl: coverImage,
      pinNumber: pinNum,
    });
    console.log(`    Image: ${path.basename(imagePath)}`);

    // Find board ID
    const boardId = findBoardId(pin.board, boardIds);
    if (!boardId) {
      // Fallback to category-based mapping
      const fallbackBoard = getBoardForCategory(categories[0] || "");
      const fallbackId = findBoardId(fallbackBoard, boardIds);
      if (!fallbackId) {
        console.error(`    ✗ Board not found: "${pin.board}" — skipping`);
        continue;
      }
      console.log(
        `    Board "${pin.board}" not found, using fallback: "${fallbackBoard}"`
      );
    }

    const targetBoardId =
      findBoardId(pin.board, boardIds) ||
      findBoardId(getBoardForCategory(categories[0] || ""), boardIds);

    if (!targetBoardId) {
      console.error(`    ✗ No board ID found — skipping Pin ${pinNum}`);
      continue;
    }

    try {
      console.log(
        `  Creating Pin ${pinNum}${schedules[i] ? " (scheduled)" : ""}...`
      );
      const result = await createPin(
        token,
        targetBoardId,
        pin.title,
        pin.description,
        link,
        imagePath,
        schedules[i]
      );

      const status = schedules[i] ? "scheduled" : "published";
      pinResults.push({
        pinNumber: pinNum,
        pinId: result.id,
        url: result.url,
        boardName: pin.board,
        title: pin.title,
        status,
        scheduledFor: schedules[i],
      });

      if (status === "published") {
        console.log(`    ✓ Pin ${pinNum} created → ${result.url}`);
      } else {
        const schedDate = new Date(schedules[i]!).toLocaleDateString();
        console.log(`    ✓ Pin ${pinNum} scheduled for ${schedDate}`);
      }
    } catch (e) {
      console.error(`    ✗ Pin ${pinNum} failed: ${(e as Error).message}`);
    }
  }

  // Save to pin log
  if (pinResults.length > 0) {
    updatePinLog(slug, pinResults);
  }

  console.log("\n  Summary:");
  console.log(`  Pins created: ${pinResults.length}`);
  console.log(
    `  Boards: ${[...new Set(pinResults.map((p) => p.boardName))].join(", ")}`
  );
  console.log(`  Log: ${PIN_LOG_FILE}\n`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err.message || err);
  process.exit(1);
});
