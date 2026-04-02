/**
 * setup-boards.ts — Create Pinterest boards and save their IDs
 *
 * Usage (one-time):
 *   npx tsx scripts/distribute/pinterest/setup-boards.ts
 */

import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as path from "path";
import { getValidToken } from "./auth";

const BOARDS_FILE = path.resolve("scripts/distribute/pinterest/boards.json");
const API_BASE = "https://api.pinterest.com/v5";

const BOARDS_TO_CREATE = [
  "Raising Emotionally Healthy Kids",
  "Child Development Ages 3-12",
  "Parenting Tips That Work",
  "Kids Sleep Tips",
  "Child Behaviour and Discipline",
  "School Readiness and Learning",
  "Screen Time and Kids",
  "Parenting Self-Care",
];

// Category → board name mapping
export const CATEGORY_BOARD_MAP: Record<string, string> = {
  "Child Development": "Child Development Ages 3-12",
  Behaviour: "Child Behaviour and Discipline",
  Sleep: "Kids Sleep Tips",
  School: "School Readiness and Learning",
  "Parenting Strategies": "Parenting Tips That Work",
  "Emotional Regulation": "Raising Emotionally Healthy Kids",
  "Screen Time": "Screen Time and Kids",
  "Parent Wellbeing": "Parenting Self-Care",
  Activities: "Parenting Tips That Work",
  Parenting: "Parenting Tips That Work",
};

const DEFAULT_BOARD = "Parenting Tips That Work";

export function getBoardForCategory(category: string): string {
  return CATEGORY_BOARD_MAP[category] || DEFAULT_BOARD;
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
    throw new Error(`Pinterest API error (${res.status}): ${err}`);
  }

  return res.json();
}

async function main() {
  console.log("\n  Pinterest Board Setup");
  console.log("  " + "=".repeat(40));

  const token = await getValidToken();

  // Fetch existing boards
  console.log("  Fetching existing boards...");
  const existing = await apiCall("/boards?page_size=100", token);
  const existingNames = new Map<string, string>();
  for (const board of existing.items || []) {
    existingNames.set(board.name.toLowerCase(), board.id);
  }

  const boardMap: Record<string, string> = {};

  for (const boardName of BOARDS_TO_CREATE) {
    const key = boardName.toLowerCase();
    if (existingNames.has(key)) {
      boardMap[boardName] = existingNames.get(key)!;
      console.log(`  ✓  Already exists: ${boardName}`);
    } else {
      try {
        const created = await apiCall("/boards", token, "POST", {
          name: boardName,
          description: `${boardName} — parenting tips and insights from Nurture by Cortiq Labs`,
          privacy: "PUBLIC",
        });
        boardMap[boardName] = created.id;
        console.log(`  +  Created: ${boardName} (${created.id})`);
        // Rate limit: 1 second between creates
        await new Promise((r) => setTimeout(r, 1000));
      } catch (e) {
        console.error(`  ✗  Failed to create "${boardName}": ${(e as Error).message}`);
      }
    }
  }

  fs.writeFileSync(BOARDS_FILE, JSON.stringify(boardMap, null, 2));
  console.log(`\n  Board IDs saved to ${BOARDS_FILE}`);
  console.log(`  Total boards: ${Object.keys(boardMap).length}\n`);

  process.exit(0);
}

// Only run if executed directly (not imported)
const isMain = process.argv[1]?.includes("setup-boards");
if (isMain) {
  main().catch((err) => {
    console.error("Error:", err.message || err);
    process.exit(1);
  });
}
