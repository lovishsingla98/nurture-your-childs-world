/**
 * create-post.ts — Push a blog post draft to Firestore with auto cover image
 *
 * Usage:
 *   npx tsx scripts/blog/create-post.ts scripts/blog/drafts/my-post.json
 *
 * Set UNSPLASH_ACCESS_KEY env var for auto cover images (optional).
 * Without it, posts are created without a cover image.
 *
 * Uses the client Firebase SDK with the Nurture project config.
 */

import * as dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

// --- Firebase init ---

const app = initializeApp({
  apiKey: "AIzaSyBNnvfHAfYMXOEktg9B5DjjDB0LcL5MPrk",
  authDomain: "nurture-466617.firebaseapp.com",
  projectId: "nurture-466617",
  storageBucket: "nurture-466617.firebasestorage.app",
  messagingSenderId: "812235623979",
  appId: "1:812235623979:web:36abf051e42729a3c2e46e",
});

const db = getFirestore(app);
const postsRef = collection(db, "posts");

// --- Types ---

interface PostDraft {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categories: string[];
  tags: string[];
  status: string;
  metaTitle: string;
  metaDescription: string;
  authorId: string;
  coverImage: string | null;
  publishedAt: null;
  scheduledAt: null;
  commentCount: number;
  viewCount: number;
}

// --- Unsplash cover image ---

async function fetchCoverImage(
  tags: string[],
  categories: string[]
): Promise<{ url: string; photographerName: string; photographerUrl: string } | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log("  ℹ  UNSPLASH_ACCESS_KEY not set — skipping cover image");
    return null;
  }

  // Build a search query from tags + categories, focusing on parenting/child imagery
  const searchTerms = [...tags.slice(0, 2), ...categories.slice(0, 1)]
    .map((t) => t.replace(/-/g, " "))
    .join(" ");
  const searchQuery = `${searchTerms} child parenting`;

  console.log(`  🔍 Searching Unsplash for: "${searchQuery}"`);

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${encodeURIComponent(searchQuery)}&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.log(`  ⚠  Unsplash API error (${res.status}): ${errText}`);
      return null;
    }

    const data = await res.json();
    return {
      url: data.urls.regular, // 1080px wide
      photographerName: data.user.name,
      photographerUrl: data.user.links.html,
    };
  } catch (e) {
    console.log(`  ⚠  Unsplash fetch failed: ${(e as Error).message}`);
    return null;
  }
}


// --- Validation ---

const REQUIRED_FIELDS: (keyof PostDraft)[] = [
  "title",
  "slug",
  "content",
  "excerpt",
  "categories",
];

function validate(data: Record<string, unknown>): string[] {
  const errors: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === "") {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (Array.isArray(data.categories) && data.categories.length === 0) {
    errors.push("categories must contain at least one category");
  }

  if (typeof data.slug === "string" && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push(
      "slug must be lowercase alphanumeric with hyphens only (e.g. 'my-post-slug')"
    );
  }

  if (typeof data.excerpt === "string" && data.excerpt.length > 280) {
    errors.push(`excerpt is ${data.excerpt.length} chars — max 280`);
  }

  if (typeof data.metaTitle === "string" && data.metaTitle.length > 60) {
    errors.push(`metaTitle is ${data.metaTitle.length} chars — max 60`);
  }

  if (
    typeof data.metaDescription === "string" &&
    data.metaDescription.length > 160
  ) {
    errors.push(
      `metaDescription is ${data.metaDescription.length} chars — max 160`
    );
  }

  return errors;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help") {
    console.log(
      "Usage: npx tsx scripts/blog/create-post.ts <path-to-post.json>\n\n" +
        "Environment variables (optional):\n" +
        "  UNSPLASH_ACCESS_KEY  — Auto-fetch a cover image from Unsplash\n\n" +
        "The JSON file must match the shape in scripts/blog/output-template.json"
    );
    process.exit(0);
  }

  const jsonPath = path.resolve(args[0]);

  if (!fs.existsSync(jsonPath)) {
    console.error(`Error: File not found: ${jsonPath}`);
    process.exit(1);
  }

  // Parse JSON
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  } catch (e) {
    console.error(`Error: Failed to parse JSON file: ${(e as Error).message}`);
    process.exit(1);
  }

  // Validate
  const errors = validate(data);
  if (errors.length > 0) {
    console.error("Validation errors:");
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Check slug uniqueness
  const slugQuery = query(postsRef, where("slug", "==", data.slug));
  const slugSnap = await getDocs(slugQuery);
  if (!slugSnap.empty) {
    console.error(
      `Error: Slug "${data.slug}" already exists (doc ID: ${slugSnap.docs[0].id}).\n` +
        "Choose a different slug."
    );
    process.exit(1);
  }

  // Fetch cover image from Unsplash (if key is set and no coverImage provided)
  let coverImageUrl = (data.coverImage as string) || "";
  let attribution = "";

  if (!coverImageUrl) {
    const tags = (data.tags as string[]) || [];
    const categories = (data.categories as string[]) || [];
    const unsplashResult = await fetchCoverImage(tags, categories);

    if (unsplashResult) {
      // Use Unsplash CDN URL directly — high quality, fast, free for commercial use
      coverImageUrl = unsplashResult.url;
      attribution = `Photo by ${unsplashResult.photographerName} on Unsplash (${unsplashResult.photographerUrl})`;
      console.log(`  📸 ${attribution}`);
    }
  }

  // Build the document
  const now = Timestamp.now();
  const postDoc = {
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt,
    coverImage: coverImageUrl,
    coverImageAttribution: attribution,
    categories: data.categories,
    tags: data.tags || [],
    status: "draft",
    publishedAt: null,
    scheduledAt: null,
    authorId: data.authorId || "system",
    metaTitle: data.metaTitle || "",
    metaDescription: data.metaDescription || "",
    viewCount: 0,
    commentCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  // Write to Firestore
  const docRef = await addDoc(postsRef, postDoc);

  console.log("\n  Post created successfully!\n");
  console.log(`  Document ID:  ${docRef.id}`);
  console.log(`  Slug:         ${data.slug}`);
  console.log(`  Cover:        ${coverImageUrl || "(none)"}`);
  console.log(`  Status:       draft`);
  console.log(`  Admin URL:    http://localhost:5173/admin/blog/${docRef.id}/edit`);
  console.log(
    `\n  Next: open the admin URL to review and publish.`
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("Unexpected error:", err.message || err);
  process.exit(1);
});
