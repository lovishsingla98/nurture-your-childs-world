import {
  collection,
  query,
  where,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import type { DocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import type { Post, PostsQueryResult, CategoryCount } from "@/types/blog";

const POSTS_PER_PAGE = 12;
const postsRef = collection(db, "posts");

// --- Helpers ---

function docToPost(docSnap: DocumentSnapshot): Post {
  const data = docSnap.data()!;
  return { id: docSnap.id, ...data } as Post;
}

/**
 * Calculate estimated read time from TipTap JSON content string.
 * Extracts text nodes, counts words, divides by 200 wpm.
 */
export function calculateReadTime(content: string): number {
  if (!content) return 1;
  try {
    const parsed = JSON.parse(content);
    const text = extractText(parsed);
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  } catch {
    // Fallback: strip HTML tags and count words
    const plainText = content.replace(/<[^>]*>/g, " ");
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }
}

function extractText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as Record<string, unknown>;
  if (n.type === "text" && typeof n.text === "string") return n.text;
  if (Array.isArray(n.content)) {
    return n.content.map(extractText).join(" ");
  }
  return "";
}

/**
 * Format a Firestore Timestamp to a readable date string.
 */
export function formatDate(timestamp: Timestamp | null): string {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// --- Query functions ---

/**
 * Fetch a page of published posts, optionally filtered by category.
 * Uses cursor-based pagination with Firestore startAfter.
 */
export async function getPosts(
  page: number,
  category?: string,
): Promise<PostsQueryResult> {
  // Simple query — no composite index needed.
  // Sorting and pagination handled client-side for now.
  const constraints: Parameters<typeof query>[1][] = [
    where("status", "==", "published"),
  ];

  if (category) {
    constraints.push(where("categories", "array-contains", category));
  }

  const q = query(postsRef, ...constraints);
  const snapshot = await getDocs(q);

  // Sort client-side by publishedAt descending
  const allPosts = snapshot.docs
    .map(docToPost)
    .sort((a, b) => {
      const aTime = a.publishedAt?.toMillis() ?? 0;
      const bTime = b.publishedAt?.toMillis() ?? 0;
      return bTime - aTime;
    });

  const totalCount = allPosts.length;

  // Client-side pagination
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const posts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  return { posts, totalCount, lastDoc: null };
}

/**
 * Fetch a single published post by its slug.
 * Returns null if not found or not published.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(postsRef, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const post = docToPost(snapshot.docs[0]);

  // Allow published posts (and previews handled separately)
  if (post.status !== "published") return null;

  return post;
}

/**
 * Fetch a post by slug including drafts (for admin preview).
 */
export async function getPostBySlugAdmin(slug: string): Promise<Post | null> {
  const q = query(postsRef, where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToPost(snapshot.docs[0]);
}

/**
 * Get all categories with their post counts from published posts.
 */
export async function getCategories(): Promise<CategoryCount[]> {
  const q = query(
    postsRef,
    where("status", "==", "published")
  );
  const snapshot = await getDocs(q);

  const counts: Record<string, number> = {};
  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const categories = data.categories as string[];
    categories?.forEach((cat) => {
      counts[cat] = (counts[cat] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export { POSTS_PER_PAGE };
